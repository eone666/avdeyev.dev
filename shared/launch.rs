/// Shared by the WASM header and static HTML generator.
pub fn terminal_command(origin: &str) -> String {
    format!("curl -fsSL {} | sh", origin.trim_end_matches('/'))
}
