//! Browser host. All state, input and rendering live in Rust; generated JS only loads WASM.
use crate::{widgets::HelpDialog, App};
use ratatui::{layout::Rect, widgets::Widget, Terminal, TerminalOptions, Viewport};
use ratzilla::DomBackend;
use std::{cell::RefCell, collections::HashMap};
use wasm_bindgen::{prelude::*, JsCast};
use wasm_bindgen_futures::{spawn_local, JsFuture};
use web_sys::{
    Document, Element, Event, EventTarget, HtmlDialogElement, HtmlElement, KeyboardEvent,
    PointerEvent,
};

struct Listener {
    target: EventTarget,
    name: &'static str,
    callback: Closure<dyn FnMut(Event)>,
}
impl Drop for Listener {
    fn drop(&mut self) {
        let _ = self
            .target
            .remove_event_listener_with_callback(self.name, self.callback.as_ref().unchecked_ref());
    }
}
struct Browser {
    app: App,
    terminal: Option<Terminal<DomBackend>>,
    controls: HashMap<String, Element>,
    cell_width: f64,
    cell_height: f64,
    grid_size: (u16, u16),
    keyboard: bool,
    mode_changed: bool,
    touch_y: Option<i32>,
    scroll_remainder: f64,
    dragged: bool,
    pointer: Option<(i32, i32)>,
    help_return: Option<HtmlElement>,
    listeners: Vec<Listener>,
}
thread_local! { static WEB: RefCell<Option<Browser>> = const { RefCell::new(None) }; }
fn window() -> web_sys::Window {
    web_sys::window().expect("browser window")
}
fn document() -> Document {
    window().document().expect("browser document")
}
fn element(id: &str) -> Element {
    document()
        .get_element_by_id(id)
        .unwrap_or_else(|| panic!("Missing {id}"))
}
fn error(e: impl std::fmt::Display) -> JsValue {
    JsValue::from_str(&e.to_string())
}
fn with<T>(f: impl FnOnce(&mut Browser) -> T) -> T {
    WEB.with_borrow_mut(|web| f(web.as_mut().expect("initialized browser")))
}
fn report(result: Result<(), JsValue>) {
    if let Err(e) = result {
        web_sys::console::error_1(&e);
    }
}
fn target(event: &Event) -> Option<Element> {
    event
        .target()?
        .dyn_into::<Element>()
        .ok()?
        .closest("[data-tui]")
        .ok()?
}
fn selected_text() -> bool {
    window()
        .get_selection()
        .ok()
        .flatten()
        .is_some_and(|selection| !selection.is_collapsed())
}
fn focus(id: &str, scroll: bool) {
    if let Some(control) = document()
        .query_selector(&format!("[data-tui='{id}']"))
        .ok()
        .flatten()
    {
        if let Some(html) = control.dyn_ref::<HtmlElement>() {
            let options = web_sys::FocusOptions::new();
            options.set_prevent_scroll(true);
            let _ = html.focus_with_options(&options);
            if scroll {
                let options = web_sys::ScrollIntoViewOptions::new();
                options.set_block(web_sys::ScrollLogicalPosition::Nearest);
                options.set_inline(web_sys::ScrollLogicalPosition::Nearest);
                html.scroll_into_view_with_scroll_into_view_options(&options);
            }
        }
    }
}
fn listen(
    target: EventTarget,
    name: &'static str,
    callback: impl FnMut(Event) + 'static,
) -> Result<Listener, JsValue> {
    let callback = Closure::wrap(Box::new(callback) as Box<dyn FnMut(Event)>);
    let options = web_sys::AddEventListenerOptions::new();
    options.set_passive(false);
    target.add_event_listener_with_callback_and_add_event_listener_options(
        name,
        callback.as_ref().unchecked_ref(),
        &options,
    )?;
    Ok(Listener {
        target,
        name,
        callback,
    })
}

impl Browser {
    fn paint(&mut self) -> Result<(), JsValue> {
        self.mode_changed = false;
        self.terminal
            .as_mut()
            .ok_or_else(|| error("No terminal"))?
            .draw(|frame| self.app.render(frame))
            .map_err(error)?;
        let parent = element("tui-controls");
        self.controls.retain(|id, control| {
            let keep = self.app.targets.iter().any(|target| target.id == *id);
            if !keep {
                control.remove();
            }
            keep
        });
        for target in &self.app.targets {
            let control = if let Some(control) = self.controls.get(&target.id) {
                control.clone()
            } else {
                let control = document().create_element(if target.url.is_empty() {
                    "button"
                } else {
                    "a"
                })?;
                control.set_class_name("tui-control");
                control.set_attribute("data-tui", &target.id)?;
                control.set_attribute("aria-label", &target.label)?;
                if !target.url.is_empty() {
                    control.set_attribute("href", &target.url)?;
                    if !target.url.starts_with("mailto:") {
                        control.set_attribute("target", "_blank")?;
                        control.set_attribute("rel", "noopener noreferrer")?;
                    }
                } else {
                    control.set_attribute("type", "button")?;
                }
                parent.append_child(&control)?;
                self.controls.insert(target.id.clone(), control.clone());
                control
            };
            let css = format!(
                "left:{}px;top:{}px;width:{}px;height:{}px",
                target.x as f64 * self.cell_width,
                target.y as f64 * self.cell_height,
                target.width as f64 * self.cell_width,
                target.height as f64 * self.cell_height
            );
            if control.get_attribute("style").as_deref() != Some(css.as_str()) {
                control.set_attribute("style", &css)?;
            }
            if let Some(index) = target.id.strip_prefix("tab-") {
                let selected = index.parse::<usize>().ok() == Some(self.app.tab);
                control.set_attribute("role", "tab")?;
                control.set_attribute("aria-selected", if selected { "true" } else { "false" })?;
                control.set_attribute("tabindex", if selected { "0" } else { "-1" })?;
            }
        }
        Ok(())
    }
    fn measure(&mut self, rebuild: bool) -> Result<(), JsValue> {
        let grid = element("tui-grid");
        let probe = document().create_element("pre")?;
        probe.set_attribute(
            "style",
            "margin:0;line-height:normal;position:absolute;visibility:hidden",
        )?;
        probe.set_inner_html("<span style='display:inline-block;width:1ch'>█</span>");
        grid.append_child(&probe)?;
        let rect = probe
            .first_element_child()
            .unwrap()
            .get_bounding_client_rect();
        self.cell_width = rect.width();
        self.cell_height = rect.height();
        probe.remove();
        let width =
            ((element("tui").client_width() as f64 / self.cell_width).floor() as u16).max(32);
        let height =
            ((window().inner_height()?.as_f64().unwrap_or(800.) / self.cell_height).floor() as u16)
                .max(16);
        let capacity = height;
        self.app.viewport_height = Some(height);
        if rebuild || self.grid_size != (width, capacity) {
            self.terminal = None;
            grid.set_inner_html("");
            grid.set_attribute(
                "style",
                &format!(
                    "width:{}px;height:{}px",
                    width as f64 * self.cell_width,
                    capacity as f64 * self.cell_height
                ),
            )?;
            self.terminal = Some(
                Terminal::with_options(
                    DomBackend::new_by_id("tui-grid").map_err(error)?,
                    TerminalOptions {
                        viewport: Viewport::Fixed(Rect::new(0, 0, width, capacity)),
                    },
                )
                .map_err(error)?,
            );
            self.grid_size = (width, capacity);
        }
        self.paint()?;
        grid.set_attribute(
            "style",
            &format!(
                "width:{}px;height:{}px",
                width as f64 * self.cell_width,
                height as f64 * self.cell_height
            ),
        )?;
        Ok(())
    }
    fn select(&mut self, index: usize, framed: bool) -> Result<(), JsValue> {
        let index = index.min(self.app.count().saturating_sub(1));
        if self.app.selected == index && self.app.framed == framed && !self.mode_changed {
            return Ok(());
        }
        self.app.selected = index;
        self.app.framed = framed;
        self.paint()
    }
    fn switch(&mut self, index: usize) -> Result<(), JsValue> {
        self.app.switch_tab(index);
        self.controls.retain(|id, control| {
            if id.starts_with("row-") {
                control.remove();
                false
            } else {
                true
            }
        });
        self.measure(false)
    }
    fn set_mode(&mut self, keyboard: bool) {
        self.mode_changed |= self.keyboard != keyboard;
        self.keyboard = keyboard;
        self.app.keyboard = keyboard;
        let _ = document()
            .document_element()
            .unwrap()
            .set_attribute("data-input", if keyboard { "keyboard" } else { "pointer" });
    }
}

fn switch(index: usize, keyboard: bool) {
    report(with(|web| {
        web.set_mode(keyboard);
        web.switch(index)?;
        if keyboard {
            web.app.focused = Some("row-0".into());
            web.app.reveal_focus = true;
            web.select(0, true)?;
        }
        Ok(())
    }));
    if keyboard {
        focus("row-0", false);
    }
}
fn toggle_help() {
    let dialog: HtmlDialogElement = element("help-dialog").unchecked_into();
    if dialog.open() {
        dialog.close();
        return;
    }
    with(|web| {
        web.help_return = document()
            .active_element()
            .and_then(|e| e.dyn_into::<HtmlElement>().ok())
    });
    if let Err(e) = dialog.show_modal() {
        report(Err(e));
        return;
    }
    report(draw_help());
}
fn draw_help() -> Result<(), JsValue> {
    let (cw, ch) = with(|web| (web.cell_width, web.cell_height));
    let grid = element("help-grid");
    grid.set_inner_html("");
    let width = ((element("help-dialog").client_width() as f64 / cw).floor() as u16).max(32);
    grid.set_attribute(
        "style",
        &format!("width:{}px;height:{}px", width as f64 * cw, 19. * ch),
    )?;
    let mut terminal = Terminal::with_options(
        DomBackend::new_by_id("help-grid").map_err(error)?,
        TerminalOptions {
            viewport: Viewport::Fixed(Rect::new(0, 0, width, 19)),
        },
    )
    .map_err(error)?;
    terminal
        .draw(|frame| HelpDialog { native: false }.render(frame.area(), frame.buffer_mut()))
        .map_err(error)?;
    Ok(())
}
fn copy_email() {
    let promise = window()
        .navigator()
        .clipboard()
        .write_text("contact@avdeyev.dev");
    spawn_local(async move {
        let message = if JsFuture::from(promise).await.is_ok() {
            "Email address copied."
        } else {
            "contact@avdeyev.dev"
        };
        let toast = element("toast");
        toast.set_text_content(Some(message));
        let _ = toast.remove_attribute("hidden");
        let closure = Closure::once_into_js(move || {
            let _ = toast.set_attribute("hidden", "");
        });
        let _ = window()
            .set_timeout_with_callback_and_timeout_and_arguments_0(closure.unchecked_ref(), 3200);
    });
}
fn key(event: Event) {
    let Ok(key) = event.dyn_into::<KeyboardEvent>() else {
        return;
    };
    if key.alt_key() || key.ctrl_key() || key.meta_key() || key.is_composing() {
        return;
    }
    if let Some(target) = key.target().and_then(|e| e.dyn_into::<Element>().ok()) {
        if target
            .closest("input,textarea,select,[contenteditable=true]")
            .ok()
            .flatten()
            .is_some()
        {
            return;
        }
    }
    let code = key.code();
    let name = if code.starts_with("Key") && code.len() == 4 {
        code[3..].to_lowercase()
    } else if code == "Slash" && key.shift_key() {
        "?".into()
    } else {
        key.key()
    };
    if name == "?" {
        key.prevent_default();
        toggle_help();
        return;
    }
    if name == "Shift" {
        let _ = document()
            .document_element()
            .unwrap()
            .set_attribute("data-selecting", "true");
    }
    if element("help-dialog")
        .unchecked_ref::<HtmlDialogElement>()
        .open()
    {
        return;
    }
    if name == "Tab" {
        key.prevent_default();
        let id = with(|web| {
            web.set_mode(true);
            let id = web.app.advance_focus(key.shift_key());
            report(web.paint());
            id
        });
        focus(&id, true);
        return;
    }
    if key.shift_key() || selected_text() {
        return;
    }
    match name.as_str() {
        "ArrowLeft" | "h" | "ArrowRight" | "l" => {
            key.prevent_default();
            let tab = with(|web| {
                (web.app.tab
                    + if name == "l" || name == "ArrowRight" {
                        1
                    } else {
                        2
                    })
                    % 3
            });
            switch(tab, true);
        }
        "ArrowDown" | "j" | "ArrowUp" | "k" => {
            key.prevent_default();
            let id = with(|web| {
                let framed = web.app.framed;
                web.set_mode(true);
                if framed {
                    web.app.navigate(name == "j" || name == "ArrowDown");
                } else {
                    web.app.framed = true;
                    web.app.reveal_focus = true;
                }
                web.app.focused = Some(format!("row-{}", web.app.selected));
                report(web.paint());
                format!("row-{}", web.app.selected)
            });
            focus(&id, true);
        }
        "c" => {
            key.prevent_default();
            copy_email();
        }
        "Enter"
            if document()
                .active_element()
                .is_some_and(|el| el.tag_name() == "BODY") =>
        {
            let id = with(|web| format!("row-{}", web.app.selected));
            if let Some(control) = document()
                .query_selector(&format!("[data-tui='{id}']"))
                .ok()
                .flatten()
            {
                control.unchecked_ref::<HtmlElement>().click();
            }
        }
        _ => {}
    }
}
fn pointer(event: Event) {
    let Ok(pointer) = event.clone().dyn_into::<PointerEvent>() else {
        return;
    };
    if event.type_() == "pointerdown" {
        with(|web| {
            web.dragged = false;
            if pointer.pointer_type() == "touch" {
                web.touch_y = Some(pointer.client_y());
                web.scroll_remainder = 0.;
            }
        });
    }
    if pointer.pointer_type() == "touch" && event.type_() == "pointermove" {
        let handled = with(|web| {
            if let Some(previous) = web.touch_y {
                let dy = previous - pointer.client_y();
                web.touch_y = Some(pointer.client_y());
                if dy.abs() > 2 {
                    web.dragged = true;
                }
                web.scroll_remainder += dy as f64 / web.cell_height;
                let rows = web.scroll_remainder.trunc() as i32;
                web.scroll_remainder -= rows as f64;
                if rows != 0 {
                    web.app.scroll_by(rows);
                    report(web.paint());
                }
                true
            } else {
                false
            }
        });
        if handled {
            event.prevent_default();
            return;
        }
    }
    let position = (pointer.client_x(), pointer.client_y());
    let moved = with(|web| {
        if event.type_() == "pointermove" && web.pointer == Some(position) {
            return false;
        }
        web.pointer = Some(position);
        web.set_mode(false);
        true
    });
    if !moved || selected_text() || (pointer.buttons() != 0 && event.type_() == "pointermove") {
        return;
    }
    let id = target(&event).and_then(|el| el.get_attribute("data-tui"));
    report(with(|web| {
        if let Some(index) = id
            .as_deref()
            .and_then(|s| s.strip_prefix("row-"))
            .and_then(|i| i.parse().ok())
        {
            web.select(index, true)
        } else {
            web.select(web.app.selected, false)
        }
    }));
}

#[wasm_bindgen(start)]
pub fn start() -> Result<(), JsValue> {
    spawn_local(async {
        let fonts = document().fonts();
        let loaded = JsFuture::from(fonts.load("12px 'JetBrains Mono'")).await;
        if loaded.is_err() || !fonts.check("12px 'JetBrains Mono'").unwrap_or(false) {
            element("boot-status").set_text_content(Some(
                "The monospace font could not be loaded. Please reload.",
            ));
            return;
        }
        report(initialize());
    });
    Ok(())
}
fn initialize() -> Result<(), JsValue> {
    let root = element("tui");
    root.set_inner_html("<h1 class='sr-only'>Ivan Avdeyev — Frontend Developer</h1><div id='tui-grid' class='terminal-grid' aria-hidden='true'></div><nav id='tui-controls' aria-label='Terminal controls'></nav>");
    let mut app = App::portfolio();
    app.show_launch_command = true;
    app.launch_command = format!(
        "$: {}",
        crate::terminal_command(&window().location().origin()?)
    );
    WEB.with_borrow_mut(|web| {
        *web = Some(Browser {
            app,
            terminal: None,
            controls: HashMap::new(),
            cell_width: 0.,
            cell_height: 0.,
            grid_size: (0, 0),
            keyboard: false,
            mode_changed: false,
            touch_y: None,
            scroll_remainder: 0.,
            dragged: false,
            pointer: None,
            help_return: None,
            listeners: Vec::new(),
        })
    });
    report(with(|web| web.measure(true)));
    let doc: EventTarget = document().into();
    let win: EventTarget = window().into();
    let listeners = vec![
        listen(doc.clone(), "keydown", key)?,
        listen(doc.clone(), "keyup", |event| {
            if event
                .dyn_ref::<KeyboardEvent>()
                .is_some_and(|e| e.key() == "Shift")
            {
                let _ = document()
                    .document_element()
                    .unwrap()
                    .remove_attribute("data-selecting");
            }
        })?,
        listen(doc.clone(), "wheel", |event| {
            if element("help-dialog")
                .unchecked_ref::<HtmlDialogElement>()
                .open()
            {
                return;
            }
            if let Some(wheel) = event.dyn_ref::<web_sys::WheelEvent>() {
                event.prevent_default();
                report(with(|web| {
                    if wheel.client_y() as f64 >= web.app.body.y as f64 * web.cell_height
                        && (wheel.client_y() as f64)
                            < web.app.body.bottom() as f64 * web.cell_height
                    {
                        let delta = match wheel.delta_mode() {
                            1 => wheel.delta_y(),
                            2 => wheel.delta_y() * web.app.body.height as f64,
                            _ => wheel.delta_y() / web.cell_height,
                        };
                        web.scroll_remainder += delta;
                        let rows = web.scroll_remainder.trunc() as i32;
                        web.scroll_remainder -= rows as f64;
                        if rows != 0 {
                            web.app.scroll_by(rows);
                            web.paint()?;
                        }
                    }
                    Ok(())
                }));
            }
        })?,
        listen(doc.clone(), "pointermove", pointer)?,
        listen(doc.clone(), "pointerdown", pointer)?,
        listen(doc.clone(), "pointerup", |event| {
            if event
                .dyn_ref::<PointerEvent>()
                .is_some_and(|e| e.pointer_type() == "touch")
            {
                report(with(|web| {
                    web.touch_y = None;
                    web.select(web.app.selected, false)
                }));
            }
        })?,
        listen(doc.clone(), "pointercancel", |_| {
            report(with(|web| web.select(web.app.selected, false)))
        })?,
        listen(doc.clone(), "focusin", |event| {
            let id = target(&event).and_then(|el| el.get_attribute("data-tui"));
            with(|web| web.app.focused = id.clone());
            if let Some(index) = id
                .as_deref()
                .and_then(|s| s.strip_prefix("row-"))
                .and_then(|i| i.parse().ok())
            {
                report(with(|web| web.select(index, web.keyboard)));
            } else {
                report(with(|web| web.paint()));
            }
        })?,
        listen(doc.clone(), "click", |event| {
            if with(|web| {
                let dragged = web.dragged;
                web.dragged = false;
                dragged
            }) {
                event.prevent_default();
                return;
            }
            if let Some(id) = target(&event).and_then(|el| el.get_attribute("data-tui")) {
                if let Some(index) = id.strip_prefix("tab-").and_then(|i| i.parse().ok()) {
                    switch(index, false);
                } else if id == "copy" {
                    copy_email();
                } else if id == "help" {
                    toggle_help();
                }
            }
        })?,
        listen(win.clone(), "resize", |_| {
            report(with(|web| web.measure(true)));
            if element("help-dialog")
                .unchecked_ref::<HtmlDialogElement>()
                .open()
            {
                report(draw_help());
            }
        })?,
        listen(win, "blur", |_| {
            let _ = document()
                .document_element()
                .unwrap()
                .remove_attribute("data-selecting");
        })?,
        listen(element("close-help").into(), "click", |_| {
            element("help-dialog")
                .unchecked_ref::<HtmlDialogElement>()
                .close()
        })?,
        listen(element("help-dialog").into(), "close", |_| {
            let focus = with(|web| web.help_return.take());
            if let Some(control) = focus {
                let _ = control.focus();
            }
        })?,
    ];
    with(|web| web.listeners = listeners);
    element("boot-status").remove();
    document()
        .document_element()
        .unwrap()
        .set_attribute("data-renderer", "ratzilla")?;
    Ok(())
}
