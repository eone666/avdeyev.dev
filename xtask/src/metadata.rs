//! Build-time Schema.org JSON-LD and HTML shell. No UI prerendering or SSR.
use serde_json::{json, Value};
use std::{collections::BTreeSet, fs, path::Path};
#[path = "../../shared/launch.rs"]
mod launch;

fn string<'a>(value: &'a Value, key: &str) -> Result<&'a str, String> {
    value
        .get(key)
        .and_then(Value::as_str)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| format!("Missing string: {key}"))
}
fn array<'a>(value: &'a Value, key: &str) -> Result<&'a Vec<Value>, String> {
    value
        .get(key)
        .and_then(Value::as_array)
        .ok_or_else(|| format!("Missing array: {key}"))
}
fn absolute(origin: &str, url: &str) -> String {
    if url.starts_with('/') {
        format!("{origin}{url}")
    } else {
        url.into()
    }
}
fn reference(id: &str) -> Value {
    json!({"@id": id})
}

pub fn schema(portfolio: &Value, resume: &Value) -> Result<Value, String> {
    let basics = &resume["basics"];
    let origin = string(basics, "url")?.trim_end_matches('/');
    let name = string(basics, "name")?;
    let job = string(basics, "label")?;
    let url = format!("{origin}/");
    let id = |suffix: &str| format!("{url}#{suffix}");
    let person = id("person");
    let website = id("website");
    let profile = id("profile");
    let cv = format!("{origin}/cv.pdf");
    let resume_url = format!("{origin}/resume.json");
    let about = array(portfolio, "about")?
        .iter()
        .filter_map(Value::as_str)
        .collect::<Vec<_>>()
        .join("\n\n");
    let links = array(portfolio, "links")?;
    let projects = array(portfolio, "projects")?;
    let mut skills: BTreeSet<String> = string(portfolio, "skills")?
        .split('·')
        .map(|skill| skill.trim().into())
        .collect();
    let mut same_as: BTreeSet<String> = array(basics, "profiles")?
        .iter()
        .filter_map(|profile| profile["url"].as_str())
        .map(String::from)
        .collect();
    for link in links {
        let link_url = string(link, "url")?;
        if link_url.starts_with("https://") {
            same_as.insert(link_url.into());
        }
    }
    let languages: Vec<Value> = resume["languages"]
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(|language| language["language"].as_str())
        .map(|name| json!({"@type":"Language","name":name}))
        .collect();
    let project_ids: Vec<String> = projects
        .iter()
        .map(|project| string(project, "url").map(|url| format!("{url}#source-code")))
        .collect::<Result<_, _>>()?;
    let mut project_nodes = Vec::new();
    for (project, project_id) in projects.iter().zip(&project_ids) {
        let stack = string(project, "meta")?
            .split('·')
            .map(str::trim)
            .collect::<Vec<_>>();
        skills.extend(stack.iter().map(|keyword| keyword.to_string()));
        let languages: Vec<&str> = stack
            .iter()
            .copied()
            .filter(|keyword| {
                matches!(
                    *keyword,
                    "TypeScript"
                        | "JavaScript"
                        | "CSS"
                        | "HTML"
                        | "C"
                        | "C++"
                        | "Java"
                        | "Kotlin"
                        | "Rust"
                )
            })
            .collect();
        project_nodes.push(json!({
            "@type":"SoftwareSourceCode", "@id":project_id,
            "name":string(project,"title")?, "description":string(project,"description")?,
            "url":string(project,"url")?, "codeRepository":string(project,"url")?,
            "author":reference(&person), "keywords":stack, "programmingLanguage":languages,
            "subjectOf":reference(&profile)
        }));
    }
    let section_ids: Vec<Value> = ["links", "projects", "about"]
        .iter()
        .map(|section| reference(&id(&format!("section-{section}"))))
        .collect();
    let link_items: Vec<Value> = links.iter().enumerate().map(|(index,link)| Ok(json!({
        "@type":"ListItem", "position":index+1, "name":string(link,"title")?,
        "description":string(link,"description")?, "url":absolute(origin,string(link,"url")?)
    }))).collect::<Result<_,String>>()?;
    let project_items: Vec<Value> = project_ids
        .iter()
        .enumerate()
        .map(|(index, id)| json!({"@type":"ListItem","position":index+1,"item":reference(id)}))
        .collect();
    let mut graph = vec![
        json!({"@type":"WebSite","@id":website,"url":url,"name":"Avdeyev.dev","inLanguage":"en","publisher":reference(&person),"about":reference(&person)}),
        json!({"@type":"ProfilePage","@id":profile,"url":url,"name":format!("{name} | {job}"),"description":about,"inLanguage":"en","isPartOf":reference(&website),"mainEntity":reference(&person),"hasPart":section_ids,"primaryImageOfPage":reference(&id("social-image")),"relatedLink":[cv,resume_url]}),
        json!({"@type":"Person","@id":person,"name":name,"jobTitle":job,"url":url,"email":string(basics,"email")?,"description":about,"sameAs":same_as,"knowsAbout":skills,"knowsLanguage":languages,"address":{"@type":"PostalAddress","addressLocality":string(&basics["location"],"city")?,"addressCountry":string(&basics["location"],"countryCode")?},"mainEntityOfPage":reference(&profile),"subjectOf":[reference(&profile),reference(&cv),reference(&resume_url)]}),
        json!({"@type":"ImageObject","@id":id("social-image"),"contentUrl":format!("{origin}/og-tui.png"),"width":1200,"height":630,"caption":format!("{name} — {job}. Terminal-style portfolio.")}),
        json!({"@type":"WebPageElement","@id":id("section-links"),"name":"Links","isPartOf":reference(&profile),"mainEntity":reference(&id("links-list"))}),
        json!({"@type":"ItemList","@id":id("links-list"),"name":"Personal profiles, CV and contact links","numberOfItems":links.len(),"itemListElement":link_items}),
        json!({"@type":"WebPageElement","@id":id("section-projects"),"name":"Projects","isPartOf":reference(&profile),"mainEntity":reference(&id("projects-list"))}),
        json!({"@type":"ItemList","@id":id("projects-list"),"name":"Selected projects","numberOfItems":projects.len(),"itemListElement":project_items}),
        json!({"@type":"WebPageElement","@id":id("section-about"),"name":"About","text":about,"about":reference(&person),"isPartOf":reference(&profile)}),
        json!({"@type":"WebApplication","@id":id("web-application"),"name":"Avdeyev.dev terminal portfolio","url":url,"description":"An interactive terminal portfolio with links, projects and developer profile.","applicationCategory":"UtilitiesApplication","operatingSystem":"Any","browserRequirements":"JavaScript and WebAssembly support required","runtimePlatform":"WebAssembly","author":reference(&person),"about":reference(&person),"featureList":["Keyboard navigation with arrows and H/J/K/L","Tab and Shift-Tab focus navigation","Mouse and touch navigation","Email clipboard action","Fixed header and footer with independently scrollable sections"]}),
        json!({"@type":"SoftwareApplication","@id":id("terminal-application"),"name":"Avdeyev.dev native terminal portfolio","url":url,"applicationCategory":"UtilitiesApplication","operatingSystem":["Linux","macOS"],"processorRequirements":"ARM64 or x86_64","runtimePlatform":"Terminal","author":reference(&person),"about":reference(&person),"description":"Native Ratatui portfolio with keyboard and mouse navigation, independently scrollable sections and clipboard support."}),
        json!({"@type":"DigitalDocument","@id":cv,"url":cv,"name":format!("{name} — CV"),"description":"Two-page CV with an attached JSON Resume.","encodingFormat":"application/pdf","author":reference(&person),"about":reference(&person),"hasPart":reference(&resume_url)}),
        json!({"@type":"DigitalDocument","@id":resume_url,"url":resume_url,"name":format!("{name} — JSON Resume"),"description":"Complete machine-readable resume, also attached to the PDF CV.","encodingFormat":"application/json","author":reference(&person),"about":reference(&person)}),
    ];
    graph.extend(project_nodes);
    Ok(json!({"@context":"https://schema.org","@graph":graph}))
}

fn html_escape(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}
fn script_json(value: &Value) -> String {
    serde_json::to_string(value)
        .expect("serializable JSON")
        .replace('<', "\\u003c")
        .replace('>', "\\u003e")
        .replace('&', "\\u0026")
        .replace('\u{2028}', "\\u2028")
        .replace('\u{2029}', "\\u2029")
}

pub fn render(template: &str, portfolio: &Value, resume: &Value) -> Result<String, String> {
    let basics = &resume["basics"];
    let origin = string(basics, "url")?.trim_end_matches('/');
    let title = format!("{} | {}", string(basics, "name")?, string(basics, "label")?);
    let description=format!("{} — projects, professional profiles, contact details and CV. A real terminal UI, in your terminal and browser.",title.replace(" | ",", "));
    let command = launch::terminal_command(origin);
    let replacements = [
        ("{{TITLE}}", html_escape(&title)),
        ("{{DESCRIPTION}}", html_escape(&description)),
        ("{{ORIGIN}}", html_escape(origin)),
        (
            "{{SOCIAL_IMAGE}}",
            html_escape(&format!("{origin}/og-tui.png")),
        ),
        ("{{JSON_LD}}", script_json(&schema(portfolio, resume)?)),
        ("{{TERMINAL_COMMAND}}", html_escape(&command)),
        ("{{TERMINAL_COMMAND_JSON}}", script_json(&json!(command))),
        ("{{ORIGIN_JSON}}", script_json(&json!(origin))),
    ];
    let mut html = template.to_owned();
    for (marker, value) in replacements {
        html = html.replace(marker, &value);
    }
    if html.contains("{{") {
        return Err("Unresolved HTML template marker".into());
    }
    Ok(html)
}

pub fn build(root: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let portfolio: Value =
        serde_json::from_str(&fs::read_to_string(root.join("tui/content.json"))?)?;
    let resume: Value = serde_json::from_str(&fs::read_to_string(root.join("cv/resume.json"))?)?;
    let template = fs::read_to_string(root.join("web/index.html"))?;
    let html = render(&template, &portfolio, &resume).map_err(std::io::Error::other)?;
    let path = root.join("public/index.html");
    if fs::read_to_string(&path).ok().as_deref() != Some(html.as_str()) {
        fs::write(path, html)?;
    }
    println!(
        "Generated static index.html with Schema.org JSON-LD and current terminal instructions."
    );
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    fn fixtures() -> (Value, Value) {
        (
            serde_json::from_str(include_str!("../../tui/content.json")).unwrap(),
            serde_json::from_str(include_str!("../../cv/resume.json")).unwrap(),
        )
    }
    #[test]
    fn graph_describes_real_content_and_has_resolved_references() {
        let (portfolio, resume) = fixtures();
        let graph = schema(&portfolio, &resume).unwrap();
        let nodes = graph["@graph"].as_array().unwrap();
        let ids: BTreeSet<&str> = nodes
            .iter()
            .map(|node| node["@id"].as_str().unwrap())
            .collect();
        fn check(value: &Value, ids: &BTreeSet<&str>) {
            match value {
                Value::Object(object) => {
                    if object.len() == 1 && object.contains_key("@id") {
                        assert!(ids.contains(object["@id"].as_str().unwrap()));
                    }
                    for value in object.values() {
                        check(value, ids);
                    }
                }
                Value::Array(values) => {
                    for value in values {
                        check(value, ids);
                    }
                }
                _ => {}
            }
        }
        check(&graph, &ids);
        let person = nodes.iter().find(|node| node["@type"] == "Person").unwrap();
        assert_eq!(person["name"], resume["basics"]["name"]);
        for project in portfolio["projects"].as_array().unwrap() {
            assert!(nodes
                .iter()
                .any(|node| node["@type"] == "SoftwareSourceCode"
                    && node["name"] == project["title"]
                    && node["description"] == project["description"]));
        }
        let profile = nodes
            .iter()
            .find(|node| node["@type"] == "ProfilePage")
            .unwrap();
        assert_eq!(profile["mainEntity"]["@id"], person["@id"]);
    }
    #[test]
    fn changing_source_origin_updates_metadata_and_launch_instructions() {
        let (portfolio, mut resume) = fixtures();
        resume["basics"]["url"] = json!("https://example.test:8443/");
        let html = render(include_str!("../../web/index.html"), &portfolio, &resume).unwrap();
        assert!(html.contains("curl -fsSL https://example.test:8443 | sh"));
        assert!(html.contains("href=\"https://example.test:8443\""));
        assert!(html.contains("https://example.test:8443/og-tui.png"));
        assert!(!html.contains("https://avdeyev.dev/"));
    }
    #[test]
    fn static_shell_is_safe_and_contains_no_ui_prerendering() {
        let (mut portfolio, resume) = fixtures();
        portfolio["about"][0] = json!("</script><script>alert(1)</script>");
        let html = render(include_str!("../../web/index.html"), &portfolio, &resume).unwrap();
        assert!(html
            .contains("<main id=\"tui\" aria-label=\"Ivan Avdeyev — terminal portfolio\"></main>"));
        assert!(!html.contains("{{"));
        assert!(!html.contains("<script>alert(1)"));
        let script = html
            .split("<script id=\"structured-data\" type=\"application/ld+json\">")
            .nth(1)
            .unwrap()
            .split("</script>")
            .next()
            .unwrap();
        let parsed: Value = serde_json::from_str(script).unwrap();
        assert_eq!(parsed["@context"], "https://schema.org");
        assert!(html.contains("curl -fsSL https://avdeyev.dev | sh"));
        assert!(html.contains("location.origin"));
    }
}
