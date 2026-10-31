fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let mut address = "127.0.0.1:5174".to_owned();
    let mut root = "public".to_owned();
    let mut args = std::env::args().skip(1);
    while let Some(arg) = args.next() {
        match arg.as_str() {
            "--address" => address = args.next().ok_or("--address requires HOST:PORT")?,
            "--dir" => root = args.next().ok_or("--dir requires a path")?,
            _ => {
                return Err(
                    format!("Unknown argument {arg}; use --address HOST:PORT --dir PATH").into(),
                )
            }
        }
    }
    portfolio_server::serve(&address, std::path::Path::new(&root))
}
