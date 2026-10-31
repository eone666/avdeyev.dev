#[cfg(target_arch = "wasm32")]
fn main() {}

#[cfg(not(target_arch = "wasm32"))]
fn main() -> std::io::Result<()> {
    use avdeyev_tui::{widgets::PRIMARY, App};
    use crossterm::{
        event::{
            self, DisableMouseCapture, EnableMouseCapture, Event, KeyCode, KeyModifiers,
            MouseEventKind,
        },
        execute,
    };
    use ratatui::{
        layout::Rect,
        style::{Color, Style},
        widgets::{Clear, Paragraph, Widget},
    };
    use std::{
        io::{self, IsTerminal, Write},
        process::{Command, Stdio},
    };
    if std::env::args().any(|arg| arg == "--version") {
        println!("avdeyev-tui {}", env!("CARGO_PKG_VERSION"));
        return Ok(());
    }
    if !io::stdin().is_terminal() || !io::stdout().is_terminal() {
        eprintln!("Run in an interactive terminal, or use: curl -fsSL https://avdeyev.dev | sh");
        return Err(io::Error::other("interactive terminal required"));
    }
    let mut app = App::portfolio();
    let mut terminal = ratatui::init();
    let previous_hook = std::panic::take_hook();
    std::panic::set_hook(Box::new(move |info| {
        let _ = execute!(std::io::stdout(), DisableMouseCapture);
        previous_hook(info);
    }));
    let mut last_mouse = None;
    execute!(io::stdout(), EnableMouseCapture)?;
    let result = (|| -> io::Result<()> {
        loop {
            terminal.draw(|frame| {
                let area = frame.area();
                app.render(frame);
                if app.help {
                    let w = area.width.min(64);
                    let h = area.height.min(23);
                    let r = Rect::new((area.width - w) / 2, (area.height - h) / 2, w, h);
                    Clear.render(r, frame.buffer_mut());
                    avdeyev_tui::widgets::HelpDialog { native: true }.render(r, frame.buffer_mut());
                }
                if !app.status.is_empty() && area.height > 0 {
                    Paragraph::new(app.status.as_str())
                        .style(Style::default().bg(Color::Rgb(41, 41, 41)).fg(PRIMARY))
                        .render(
                            Rect::new(0, area.height - 1, area.width, 1),
                            frame.buffer_mut(),
                        );
                }
            })?;
            let mut activate = None;
            match event::read()? {
                Event::Key(key) if key.kind == event::KeyEventKind::Press => {
                    if key.code == KeyCode::Char('q')
                        || (key.code == KeyCode::Char('c')
                            && key.modifiers.contains(KeyModifiers::CONTROL))
                    {
                        break;
                    }
                    if key.code == KeyCode::Esc {
                        app.help = false;
                        continue;
                    }
                    if key.code == KeyCode::Char('?') {
                        app.help = !app.help;
                        continue;
                    }
                    let tab_key = matches!(key.code, KeyCode::Tab | KeyCode::BackTab);
                    if app.help
                        || (!tab_key
                            && key.modifiers.intersects(
                                KeyModifiers::SHIFT | KeyModifiers::CONTROL | KeyModifiers::ALT,
                            ))
                    {
                        continue;
                    }
                    app.status.clear();
                    match key.code {
                        KeyCode::Down | KeyCode::Char('j') => {
                            app.navigate(true);
                            app.reveal_focus = true;
                        }
                        KeyCode::Up | KeyCode::Char('k') => {
                            app.navigate(false);
                            app.reveal_focus = true;
                        }
                        KeyCode::Right | KeyCode::Char('l') => {
                            app.switch_tab(app.tab + 1);
                            app.framed = true;
                            app.keyboard = true;
                            app.focused = Some("row-0".into());
                            app.scroll = 0;
                            app.reveal_focus = true;
                        }
                        KeyCode::Left | KeyCode::Char('h') => {
                            app.switch_tab(app.tab + 2);
                            app.framed = true;
                            app.keyboard = true;
                            app.focused = Some("row-0".into());
                            app.scroll = 0;
                            app.reveal_focus = true;
                        }
                        KeyCode::Tab | KeyCode::BackTab => {
                            app.advance_focus(
                                key.code == KeyCode::BackTab
                                    || key.modifiers.contains(KeyModifiers::SHIFT),
                            );
                            app.reveal_focus = true;
                        }
                        KeyCode::Enter => {
                            activate = Some(
                                app.focused
                                    .clone()
                                    .unwrap_or_else(|| format!("row-{}", app.selected)),
                            )
                        }
                        KeyCode::Char('c') => activate = Some("copy".into()),
                        _ => {}
                    }
                }
                Event::Mouse(mouse) if !app.help => {
                    app.keyboard = false;
                    let y = mouse.row;
                    let hit = app
                        .targets
                        .iter()
                        .find(|t| {
                            mouse.column >= t.x
                                && mouse.column < t.x + t.width
                                && y >= t.y
                                && y < t.y + t.height
                        })
                        .cloned();
                    match mouse.kind {
                        MouseEventKind::ScrollDown => app.scroll_by(3),
                        MouseEventKind::ScrollUp => app.scroll_by(-3),
                        MouseEventKind::Moved if last_mouse != Some((mouse.column, mouse.row)) => {
                            app.framed = false;
                            if let Some(t) = &hit {
                                if let Some(i) = t.id.strip_prefix("row-") {
                                    app.selected = i.parse().unwrap_or(0);
                                    app.framed = true;
                                }
                            }
                            last_mouse = Some((mouse.column, mouse.row));
                        }
                        MouseEventKind::Up(event::MouseButton::Left) => {
                            app.focused = hit.as_ref().map(|t| t.id.clone());
                            activate = hit.map(|t| t.id)
                        }
                        _ => {}
                    }
                }
                _ => {}
            }
            if let Some(id) = activate {
                if let Some(i) = id.strip_prefix("tab-") {
                    app.switch_tab(i.parse().unwrap_or(0));
                } else if id == "help" {
                    app.help = true;
                } else if id == "copy" {
                    // OSC 52: supported terminal emulators forward this to the local clipboard,
                    // including when the application runs over SSH. No external utility required.
                    print!("\x1b]52;c;Y29udGFjdEBhdmRleWV2LmRldg==\x07");
                    io::stdout().flush()?;
                    app.status = "contact@avdeyev.dev — clipboard requested".into();
                } else if let Some(target) = app.targets.iter().find(|t| t.id == id) {
                    let url = if target.url.starts_with('/') {
                        format!("https://avdeyev.dev{}", target.url)
                    } else {
                        target.url.clone()
                    };
                    let opener = if cfg!(target_os = "macos") {
                        "open"
                    } else {
                        "xdg-open"
                    };
                    let opened = Command::new(opener)
                        .arg(&url)
                        .stdin(Stdio::null())
                        .stdout(Stdio::null())
                        .stderr(Stdio::null())
                        .spawn()
                        .and_then(|mut child| child.wait())
                        .is_ok_and(|s| s.success());
                    app.status = if opened { format!("Opened {url}") } else { url };
                }
            }
        }
        Ok(())
    })();
    let cleanup = execute!(io::stdout(), DisableMouseCapture);
    ratatui::restore();
    result.and(cleanup)
}
