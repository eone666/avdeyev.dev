use avdeyev_tui::App;
use ratatui::{backend::TestBackend, Terminal};
fn app() -> App {
    App::portfolio()
}

#[test]
fn first_key_reveals_selection_then_navigation_wraps() {
    let mut app = app();
    app.navigate(true);
    assert_eq!(app.selected, 0);
    assert!(app.framed);
    app.navigate(false);
    assert_eq!(app.selected, app.count() - 1);
    app.navigate(true);
    assert_eq!(app.selected, 0);
    app.switch_tab(1);
    assert_eq!(app.count(), 4);
    assert!(!app.framed);
    app.navigate(false);
    assert_eq!(app.selected, 0);
    app.navigate(false);
    assert_eq!(app.selected, 3);
    app.switch_tab(5);
    assert_eq!(app.tab, 2);
    assert_eq!(app.selected, 0);
}

#[test]
fn every_section_fits_narrow_and_wide_grids_and_keeps_controls() {
    for width in [32, 36, 40, 44, 54, 94, 106, 144, 194] {
        for tab in 0..3 {
            let mut app = app();
            app.switch_tab(tab);
            let height = app.required_height(width).max(70);
            let mut terminal = Terminal::new(TestBackend::new(width, height)).unwrap();
            terminal.draw(|frame| app.render(frame)).unwrap();
            assert!(app.targets.iter().any(|target| target.id == "copy"));
            assert!(app.targets.iter().any(|target| target.id == "help"));
            for target in &app.targets {
                assert!(
                    target.x + target.width <= width,
                    "{} exceeds width {width}",
                    target.id
                );
                assert!(
                    target.y + target.height <= height,
                    "{} exceeds height {height}",
                    target.id
                );
            }
            assert_eq!(
                app.targets
                    .iter()
                    .filter(|t| t.id.starts_with("row-"))
                    .count(),
                app.count()
            );
        }
    }
}

#[test]
fn launch_command_is_web_only() {
    for show in [false, true] {
        let mut app = app();
        app.show_launch_command = show;
        let mut terminal = Terminal::new(TestBackend::new(120, 80)).unwrap();
        terminal.draw(|frame| app.render(frame)).unwrap();
        let rendered = terminal
            .backend()
            .buffer()
            .content()
            .iter()
            .map(|cell| cell.symbol())
            .collect::<String>();
        assert_eq!(
            rendered.contains("$: curl -fsSL https://avdeyev.dev | sh"),
            show
        );
        assert!(!rendered.contains("root@"));
    }
}

#[test]
fn tab_order_is_shared_and_reversible() {
    let mut app = App::portfolio();
    assert_eq!(app.advance_focus(false), "tab-0");
    assert_eq!(app.advance_focus(false), "row-0");
    assert_eq!(app.advance_focus(true), "tab-0");
    assert_eq!(app.advance_focus(true), "help");
    assert_eq!(app.advance_focus(true), "copy");
    app.switch_tab(2);
    app.focused = None;
    assert_eq!(app.advance_focus(false), "tab-2");
    assert_eq!(app.advance_focus(false), "row-0");
    assert_eq!(app.advance_focus(false), "copy");
}

#[test]
fn lists_scroll_without_moving_header_or_footer() {
    for (width, height) in [(32, 24), (54, 55), (120, 30)] {
        let mut app = App::portfolio();
        app.switch_tab(1);
        let mut terminal = Terminal::new(TestBackend::new(width, height)).unwrap();
        terminal.draw(|frame| app.render(frame)).unwrap();
        let before = terminal.backend().buffer().clone();
        let body = app.body;
        app.scroll_by(3);
        terminal.draw(|frame| app.render(frame)).unwrap();
        let after = terminal.backend().buffer();
        assert!(app.scroll_max > 0);
        for y in (0..body.y).chain(body.bottom()..height) {
            for x in 0..width {
                assert_eq!(
                    before[(x, y)],
                    after[(x, y)],
                    "fixed region moved at {width}x{height}: {x},{y}"
                );
            }
        }
        assert_eq!(app.body, body);
    }
}

#[test]
fn sections_remember_their_own_scroll_position() {
    let mut app = App::portfolio();
    app.scroll = 3;
    app.switch_tab(1);
    assert_eq!(app.scroll, 0);
    app.scroll = 8;
    app.switch_tab(0);
    assert_eq!(app.scroll, 3);
    app.switch_tab(1);
    assert_eq!(app.scroll, 8);
}
