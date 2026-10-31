mod metadata;
use sha2::{Digest, Sha256};
use std::{
    path::Path,
    process::{Command, ExitStatus},
};
fn run(command: &mut Command) -> ExitStatus {
    let status = command.status().unwrap_or_else(|error| {
        eprintln!("Could not start {command:?}: {error}");
        std::process::exit(1)
    });
    if !status.success() {
        std::process::exit(status.code().unwrap_or(1));
    }
    status
}
fn build_web() {
    metadata::build(Path::new(".")).expect("static metadata generation");
    run(Command::new("cargo")
        .env("CARGO_PROFILE_RELEASE_STRIP", "none")
        .args([
            "build",
            "--locked",
            "--release",
            "--target",
            "wasm32-unknown-unknown",
            "-p",
            "avdeyev-tui",
            "--lib",
        ]));
    std::fs::create_dir_all("public/wasm").unwrap();
    run(Command::new("wasm-bindgen").args([
        "target/wasm32-unknown-unknown/release/avdeyev_tui.wasm",
        "--target",
        "web",
        "--no-typescript",
        "--out-dir",
        "public/wasm",
    ]));
    if Command::new("wasm-opt").arg("--version").output().is_ok() {
        run(Command::new("wasm-opt").args([
            "-Oz",
            "--enable-bulk-memory",
            "--enable-nontrapping-float-to-int",
            "public/wasm/avdeyev_tui_bg.wasm",
            "-o",
            "public/wasm/avdeyev_tui_bg.wasm",
        ]));
    }
}
fn main() {
    std::env::set_current_dir(Path::new(env!("CARGO_MANIFEST_DIR")).parent().unwrap()).unwrap();
    match std::env::args().nth(1).as_deref().unwrap_or("build") {
        "metadata" => metadata::build(Path::new(".")).expect("static metadata generation"),
        "wasm" => build_web(),
        "build" => {
            build_web();
            run(Command::new("cargo").args([
                "build",
                "--locked",
                "--release",
                "-p",
                "portfolio-server",
                "-p",
                "avdeyev-tui",
                "--bin",
                "portfolio-server",
                "--bin",
                "avdeyev-tui",
            ]));
            let download = Path::new("public/download");
            if download.exists() {
                std::fs::remove_dir_all(download).unwrap();
            }
            std::fs::create_dir_all(download).unwrap();
            let os = if cfg!(target_os = "macos") {
                "apple-darwin"
            } else {
                "unknown-linux-musl"
            };
            let asset = format!("avdeyev-tui-{}-{os}", std::env::consts::ARCH);
            let binary = std::fs::read("target/release/avdeyev-tui").unwrap();
            std::fs::write(download.join(&asset), &binary).unwrap();
            std::fs::write(
                download.join("checksums.txt"),
                format!("{:x}  {asset}\n", Sha256::digest(&binary)),
            )
            .unwrap();
            println!("Built native TUI, browser WASM, and Rust server. Run: target/release/portfolio-server");
        }
        "serve" => {
            run(Command::new("cargo")
                .env("TUI_MODE", "dev")
                .args(["run", "-p", "portfolio-server", "--"])
                .args(std::env::args().skip(2)));
        }
        _ => {
            eprintln!("Usage: cargo run -p xtask -- [build|wasm|metadata|serve]");
            std::process::exit(2);
        }
    }
}
