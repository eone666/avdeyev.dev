use flate2::{write::GzEncoder, Compression};
use std::{
    collections::HashMap,
    fs,
    io::{self, Write},
    path::{Component, Path},
    sync::Arc,
};
use tiny_http::{Header, Method, Request, Response, StatusCode};

pub struct Asset {
    bytes: Arc<[u8]>,
    gzip: Option<Arc<[u8]>>,
    mime: String,
}
pub struct Site {
    assets: HashMap<String, Asset>,
    development: bool,
}
fn header(name: &str, value: &str) -> Header {
    Header::from_bytes(name, value).expect("valid response header")
}

pub fn route(url: &str, agent: &str, accept: &str) -> Option<String> {
    let path = percent_encoding::percent_decode_str(url.split('?').next()?)
        .decode_utf8()
        .ok()?;
    if !path.starts_with('/') || path.contains('\\') || path.contains('\0') {
        return None;
    }
    if Path::new(path.as_ref()).components().any(|part| {
        matches!(part, Component::ParentDir)
            || matches!(part,Component::Normal(name) if name.to_string_lossy().starts_with('.'))
    }) {
        return None;
    }
    if path == "/" {
        let terminal = agent.to_ascii_lowercase().starts_with("curl/")
            || agent.to_ascii_lowercase().starts_with("wget/");
        Some(
            if terminal && !accept.to_ascii_lowercase().contains("text/html") {
                "/install.sh"
            } else {
                "/index.html"
            }
            .into(),
        )
    } else {
        Some(path.into_owned())
    }
}

pub fn request_origin(host: &str, forwarded_proto: &str) -> Option<String> {
    if host.is_empty()
        || host.len() > 255
        || !host
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || b".-:[]".contains(&byte))
    {
        return None;
    }
    let proto = if forwarded_proto
        .split(',')
        .next()
        .is_some_and(|proto| proto.trim() == "https")
    {
        "https"
    } else {
        "http"
    };
    Some(format!("{proto}://{host}"))
}

pub fn accepts_gzip(value: &str) -> bool {
    value.split(',').any(|part| {
        let mut fields = part.trim().split(';');
        if fields
            .next()
            .is_none_or(|name| !name.trim().eq_ignore_ascii_case("gzip"))
        {
            return false;
        }
        !fields.any(|field| {
            field
                .trim()
                .strip_prefix("q=")
                .and_then(|q| q.trim().parse::<f32>().ok())
                .is_some_and(|q| q <= 0.)
        })
    })
}

impl Site {
    pub fn load(root: &Path) -> io::Result<Self> {
        let mut assets = HashMap::new();
        fn visit(root: &Path, dir: &Path, assets: &mut HashMap<String, Asset>) -> io::Result<()> {
            for entry in fs::read_dir(dir)? {
                let entry = entry?;
                let path = entry.path();
                if entry.file_name().to_string_lossy().starts_with('.')
                    || entry.file_type()?.is_symlink()
                {
                    continue;
                }
                if path.is_dir() {
                    visit(root, &path, assets)?;
                    continue;
                }
                let bytes = fs::read(&path)?;
                let mime = if path.extension().is_some_and(|s| s == "sh") {
                    "text/plain; charset=utf-8".into()
                } else {
                    mime_guess::from_path(&path)
                        .first_or_octet_stream()
                        .to_string()
                };
                let gzip = if bytes.len() > 1024
                    && (mime.starts_with("text/")
                        || mime.contains("javascript")
                        || mime.contains("json")
                        || mime.contains("wasm")
                        || mime.contains("svg"))
                {
                    let mut encoder = GzEncoder::new(Vec::new(), Compression::best());
                    encoder.write_all(&bytes)?;
                    Some(Arc::from(encoder.finish()?))
                } else {
                    None
                };
                assets.insert(
                    format!(
                        "/{}",
                        path.strip_prefix(root)
                            .unwrap()
                            .to_string_lossy()
                            .replace('\\', "/")
                    ),
                    Asset {
                        bytes: bytes.into(),
                        gzip,
                        mime,
                    },
                );
            }
            Ok(())
        }
        visit(root, root, &mut assets)?;
        for required in ["/index.html", "/install.sh", "/wasm/avdeyev_tui_bg.wasm"] {
            if !assets.contains_key(required) {
                return Err(io::Error::other(format!(
                    "Missing {required}; run cargo run -p xtask -- build"
                )));
            }
        }
        let development = match std::env::var("TUI_MODE").as_deref() {
            Ok("dev") => true,
            Ok("production") | Err(std::env::VarError::NotPresent) => false,
            _ => return Err(io::Error::other("TUI_MODE must be dev or production")),
        };
        // The development script is never exposed as a public asset in production.
        let development_launcher = assets.remove("/install-dev.sh");
        if development {
            let launcher =
                development_launcher.ok_or_else(|| io::Error::other("Missing /install-dev.sh"))?;
            assets.insert("/install.sh".into(), launcher);
        }
        Ok(Self {
            assets,
            development,
        })
    }
    pub fn respond(&self, request: Request) {
        let get_header = |name: &'static str| {
            request
                .headers()
                .iter()
                .find(|h| h.field.equiv(name))
                .map(|h| h.value.as_str())
                .unwrap_or("")
        };
        let path = route(
            request.url(),
            get_header("User-Agent"),
            get_header("Accept"),
        );
        let method_ok = matches!(*request.method(), Method::Get | Method::Head);
        let (asset, status) = if !method_ok {
            (None, 405)
        } else if let Some(asset) = path.as_ref().and_then(|p| self.assets.get(p)) {
            (Some(asset), 200)
        } else {
            (self.assets.get("/404.html"), 404)
        };
        let launcher = path.as_deref() == Some("/install.sh");
        let launcher_bytes = if launcher && self.development {
            request_origin(get_header("Host"), get_header("X-Forwarded-Proto")).and_then(|origin| {
                asset.map(|asset| {
                    String::from_utf8_lossy(&asset.bytes)
                        .replace("__TUI_DOWNLOAD_BASE__", &format!("{origin}/download"))
                        .into_bytes()
                })
            })
        } else {
            None
        };
        let gzip = !launcher && accepts_gzip(get_header("Accept-Encoding"));
        let bytes = asset.map(|asset| {
            if gzip {
                asset.gzip.as_ref().unwrap_or(&asset.bytes)
            } else {
                &asset.bytes
            }
        });
        let data: Arc<[u8]> = launcher_bytes
            .map(Arc::from)
            .or_else(|| bytes.cloned())
            .unwrap_or_else(|| Arc::from(&b"Method not allowed"[..]));
        let len = data.len();
        let mut response = Response::new(
            StatusCode(status),
            vec![header(
                "Content-Type",
                asset.map_or("text/plain; charset=utf-8", |asset| &asset.mime),
            )],
            std::io::Cursor::new(data),
            Some(len),
            None,
        )
        .with_header(header("Cache-Control", "no-cache"))
        .with_header(header("Vary", "User-Agent, Accept, Accept-Encoding"))
        .with_header(header("X-Content-Type-Options", "nosniff"))
        .with_header(header("Referrer-Policy", "strict-origin-when-cross-origin"))
        .with_header(header(
            "Permissions-Policy",
            "camera=(), microphone=(), geolocation=()",
        ));
        if !method_ok {
            response.add_header(header("Allow", "GET, HEAD"));
        }
        if gzip && asset.is_some_and(|a| a.gzip.is_some()) {
            response.add_header(header("Content-Encoding", "gzip"));
        }
        if path.as_deref() == Some("/og-tui.png") {
            response.add_header(header("Access-Control-Allow-Origin", "*"));
            response.add_header(header("Cross-Origin-Resource-Policy", "cross-origin"));
        }
        if let Err(error) = request.respond(response) {
            eprintln!("Response failed: {error}");
        }
    }
}

pub fn serve(address: &str, root: &Path) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let site = Arc::new(Site::load(root)?);
    let server = Arc::new(tiny_http::Server::http(address)?);
    println!("Portfolio: http://{address}");
    std::thread::scope(|scope| {
        for _ in 0..4 {
            let site = site.clone();
            let server = server.clone();
            scope.spawn(move || {
                while let Ok(request) = server.recv() {
                    site.respond(request);
                }
            });
        }
    });
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn launcher_uses_current_origin_without_shell_injection() {
        assert_eq!(
            request_origin("127.0.0.1:5174", ""),
            Some("http://127.0.0.1:5174".into())
        );
        assert_eq!(
            request_origin("avdeyev.dev", "https"),
            Some("https://avdeyev.dev".into())
        );
        assert_eq!(
            request_origin("[::1]:5174", "http"),
            Some("http://[::1]:5174".into())
        );
        assert_eq!(
            request_origin("example.com'; bad-command; '", "https"),
            None
        );
    }
    #[test]
    fn production_script_has_a_literal_release_source_without_template_markers() {
        let script = include_str!("../../public/install.sh");
        assert!(script.contains(
            "tui_base='https://github.com/eone666/avdeyev.dev/releases/latest/download'"
        ));
        assert!(script.contains("tui_proto='=https'"));
        assert!(!script.contains("__TUI_"));
        assert!(!script.contains("localhost"));
        assert!(!script.contains("127.0.0.1"));
    }
    #[test]
    fn gzip_quality() {
        assert!(accepts_gzip("br, gzip;q=0.5"));
        assert!(accepts_gzip("GZIP"));
        assert!(!accepts_gzip("br, gzip;q=0"));
    }
    #[test]
    fn content_negotiation() {
        assert_eq!(
            route("/", "curl/8.7.1", "*/*").as_deref(),
            Some("/install.sh")
        );
        assert_eq!(
            route("/?x=1", "curl/8", "text/html").as_deref(),
            Some("/index.html")
        );
        assert_eq!(
            route("/", "Mozilla/5.0", "text/html").as_deref(),
            Some("/index.html")
        );
        assert_eq!(
            route("/cv.pdf", "curl/8", "*/*").as_deref(),
            Some("/cv.pdf")
        );
    }
    #[test]
    fn denies_private_and_traversal_paths() {
        for path in [
            "/../Cargo.toml",
            "/%2e%2e/Cargo.toml",
            "/.git/config",
            "/x/../../secret",
            "/foo%00bar",
            "/foo%5cbar",
        ] {
            assert_eq!(route(path, "", ""), None, "{path}");
        }
    }
}
