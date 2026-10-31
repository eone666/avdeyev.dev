# avdeyev.dev

One Rust/Ratatui portfolio: native terminal with Crossterm, browser WASM with
Ratzilla. The website has no frontend framework. CV generation is isolated in
`cv/` and uses Bun/Forme.

## Local development

```sh
rustup target add wasm32-unknown-unknown
cargo install wasm-bindgen-cli --version 0.2.130 --locked
bun install --cwd cv --frozen-lockfile
bun run --cwd cv build
cargo xtask build
cargo xtask serve
```

Browser: http://127.0.0.1:5174. Rebuild and restart after source changes.

```sh
cargo run --release -p avdeyev-tui
# or, while the local server is running:
curl -fsSL http://127.0.0.1:5174 | sh
```

Arrows or H/J/K/L navigate; Tab/Shift-Tab move focus; Enter opens; C copies
email; ? opens help; Esc closes it. Q or Ctrl-C exits the native app.

## Deployment

Push to `master` builds the four native binaries, WASM and CV, publishes native binaries in a
`build-<commit SHA>` GitHub Release, then deploys WASM, static assets and the Worker.
Set GitHub secrets `CLOUDFLARE_API_TOKEN` (Workers edit) and `CLOUDFLARE_ACCOUNT_ID`.
The release repository must be public. `wrangler.jsonc` binds the Worker to
`avdeyev.dev` as a Custom Domain during deployment.
WASM is served by Cloudflare at commit-versioned URLs; production `install.sh` downloads only
from GitHub Releases. Local `cargo xtask serve` uses `install-dev.sh` instead.

## Sources and checks

Portfolio: `tui/content.json`, shared widgets: `tui/src/widgets.rs`.
`web/index.html` builds to static HTML with JSON-LD via `cargo xtask metadata`.
CV: `cv/resume.json`, `cv/presentation.json`, `cv/document.tsx`.
The CV build validates the two-page PDF and its attached/public JSON Resume.

```sh
cargo test --workspace
cargo clippy --workspace --all-targets -- -D warnings
bun test --cwd cv
bun run --cwd cv typecheck
```

Code: MIT. Personal content and third-party assets: see [LICENSING.md](LICENSING.md).
