#[path = "../../shared/launch.rs"]
mod launch;
pub use launch::terminal_command;
#[cfg(target_arch = "wasm32")]
mod web;
pub mod widgets;
use ratatui::{
    layout::Rect,
    style::{Color, Style},
    widgets::{Block, Widget},
    Frame,
};
use serde::{Deserialize, Serialize};
use widgets::*;
#[derive(Deserialize, Default)]
pub struct Item {
    pub title: String,
    #[serde(default)]
    pub detail: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub meta: String,
    pub url: String,
}
#[derive(Deserialize, Default)]
pub struct Content {
    pub links: Vec<Item>,
    pub projects: Vec<Item>,
    pub bitmap: Vec<String>,
    pub about: Vec<String>,
    pub skills: String,
}
#[derive(Serialize, Clone)]
pub struct Target {
    pub id: String,
    pub label: String,
    pub url: String,
    pub x: u16,
    pub y: u16,
    pub width: u16,
    pub height: u16,
}
impl Target {
    fn new(id: String, label: String, url: String, r: Rect) -> Self {
        Self {
            id,
            label,
            url,
            x: r.x,
            y: r.y,
            width: r.width,
            height: r.height,
        }
    }
}
#[derive(Default)]
pub struct App {
    pub content: Content,
    pub tab: usize,
    pub selected: usize,
    pub framed: bool,
    pub targets: Vec<Target>,
    pub help: bool,
    pub status: String,
    pub show_launch_command: bool,
    pub launch_command: String,
    pub viewport_height: Option<u16>,
    pub focused: Option<String>,
    pub keyboard: bool,
    pub scroll: u16,
    pub scroll_max: u16,
    tab_scroll: [u16; 3],
    pub body: Rect,
    pub reveal_focus: bool,
    screen_height: u16,
    virtual_terminal: Option<ratatui::Terminal<ratatui::backend::TestBackend>>,
}
impl App {
    pub fn portfolio() -> Self {
        Self {
            content: serde_json::from_str(include_str!("../content.json"))
                .expect("valid bundled portfolio"),
            ..Self::default()
        }
    }
    pub fn switch_tab(&mut self, index: usize) {
        self.tab_scroll[self.tab] = self.scroll;
        self.tab = index % 3;
        self.selected = 0;
        self.scroll = self.tab_scroll[self.tab];
        self.framed = false;
        self.focused = if self
            .focused
            .as_deref()
            .is_some_and(|id| id.starts_with("tab-"))
        {
            Some(format!("tab-{}", self.tab))
        } else {
            None
        };
    }
    pub fn count(&self) -> usize {
        match self.tab {
            0 => self.content.links.len(),
            1 => self.content.projects.len(),
            _ => 1,
        }
    }
    pub fn advance_focus(&mut self, reverse: bool) -> String {
        let mut order = vec![format!("tab-{}", self.tab)];
        order.extend((0..self.count()).map(|index| format!("row-{index}")));
        order.extend(["copy".into(), "help".into()]);
        let current = self
            .focused
            .as_ref()
            .and_then(|id| order.iter().position(|value| value == id));
        let next = match current {
            Some(index) => (index + if reverse { order.len() - 1 } else { 1 }) % order.len(),
            None => {
                if reverse {
                    order.len() - 1
                } else {
                    0
                }
            }
        };
        let id = order[next].clone();
        self.keyboard = true;
        self.framed = id.starts_with("row-");
        if let Some(index) = id.strip_prefix("row-").and_then(|index| index.parse().ok()) {
            self.selected = index;
        }
        self.focused = Some(id.clone());
        self.reveal_focus = self.framed;
        id
    }
    fn padding(width: u16) -> u16 {
        if width < 36 {
            0
        } else if width < 64 {
            2
        } else {
            4
        }
    }
    fn identity_geometry(&self, width: u16) -> (u16, u16, u16) {
        let source = self
            .content
            .bitmap
            .first()
            .map_or(63, |row| row.chars().count() as u16);
        let available = width.saturating_sub(Self::padding(width) * 2);
        let compact = self.screen_height > 0 && self.screen_height < 40;
        let (logo_width, height) = if available >= source && !compact {
            (source, 6)
        } else {
            (source.div_ceil(2), 3)
        };
        let top = if self.show_launch_command {
            if width < 64 {
                4
            } else {
                8
            }
        } else if compact {
            0
        } else {
            2
        };
        (logo_width, height, top)
    }
    pub fn navigate(&mut self, forward: bool) {
        if self.framed {
            self.selected =
                (self.selected + if forward { 1 } else { self.count() - 1 }) % self.count();
        }
        self.framed = true;
        self.keyboard = true;
        self.focused = Some(format!("row-{}", self.selected));
        self.reveal_focus = true;
    }
    pub fn required_height(&self, width: u16) -> u16 {
        let shell_width = width.saturating_sub(Self::padding(width) * 2);
        let section = 94.min(shell_width);
        let (_, logo_height, top) = self.identity_geometry(width);
        let mut height = top + logo_height + 9;
        if self.tab == 2 {
            height += 2
                + self
                    .content
                    .about
                    .iter()
                    .map(|s| lines(s, section) + 2)
                    .sum::<u16>()
                + lines(&self.content.skills, section)
                + 7;
        } else {
            for item in if self.tab == 0 {
                &self.content.links
            } else {
                &self.content.projects
            } {
                height += NavigationItem {
                    title: &item.title,
                    detail: &item.detail,
                    description: if self.tab == 0 { "" } else { &item.description },
                    meta: &item.meta,
                    framed: false,
                    email: false,
                }
                .height(if self.tab == 0 {
                    61.min(section)
                } else {
                    section
                });
            }
        }
        height + self.description_height(shell_width) + StatusBar::height(shell_width) + 5
    }
    pub fn description(&self) -> &str {
        match self.tab {
            0 => self
                .content
                .links
                .get(self.selected)
                .map_or("", |item| item.description.as_str()),
            1 => "Selected projects, experiments, and things I build.",
            _ => "Frontend development, reusable UI systems, and curiosity.",
        }
    }
    fn description_height(&self, width: u16) -> u16 {
        if self.tab == 0 {
            self.content
                .links
                .iter()
                .map(|item| lines(&item.description, width.saturating_sub(2)))
                .max()
                .unwrap_or(1)
        } else {
            lines(self.description(), width.saturating_sub(2))
        }
    }
    pub fn scroll_by(&mut self, delta: i32) {
        self.scroll = (self.scroll as i32 + delta).clamp(0, self.scroll_max as i32) as u16;
    }
    pub fn render(&mut self, frame: &mut Frame) {
        use ratatui::{backend::TestBackend, Terminal};
        let area = frame.area();
        if area.width < 32 || area.height < 16 {
            text(
                frame.buffer_mut(),
                area,
                "Please enlarge the terminal to 32×16.",
                MUTED,
            );
            return;
        }
        self.screen_height = area.height;
        let full_height = self.required_height(area.width).max(area.height).max(60);
        let mut virtual_terminal = self
            .virtual_terminal
            .take()
            .unwrap_or_else(|| Terminal::new(TestBackend::new(area.width, full_height)).unwrap());
        if virtual_terminal.backend().buffer().area != Rect::new(0, 0, area.width, full_height) {
            virtual_terminal
                .backend_mut()
                .resize(area.width, full_height);
        }
        self.viewport_height = None;
        virtual_terminal
            .draw(|frame| self.render_full(frame))
            .unwrap();
        let source = virtual_terminal.backend().buffer();
        let shell_width = area.width.saturating_sub(Self::padding(area.width) * 2);
        let (_, logo_height, top) = self.identity_geometry(area.width);
        let original_top = top + logo_height + 9;
        let status_height = StatusBar::height(shell_width);
        let description_height = self.description_height(shell_width);
        let original_footer = full_height - status_height - description_height - 2;
        let footer_rows: Vec<u16> = if area.height < 40 {
            let mut rows: Vec<u16> =
                (original_footer..original_footer + description_height).collect();
            for group in StatusBar::groups(shell_width) {
                let y = full_height - status_height - 1 + group.rect.y;
                if !rows.contains(&y) {
                    rows.push(y);
                }
            }
            rows
        } else {
            (original_footer..full_height).collect()
        };
        let footer_top = area.height.saturating_sub(footer_rows.len() as u16);
        let body_top = original_top.min(footer_top.saturating_sub(1));
        self.body = Rect::new(0, body_top, area.width, footer_top.saturating_sub(body_top));
        let content_end = self
            .targets
            .iter()
            .filter(|target| target.id.starts_with("row-"))
            .map(|target| target.y + target.height)
            .max()
            .unwrap_or(original_top);
        self.scroll_max = content_end.saturating_sub(original_top + self.body.height);
        self.scroll = self.scroll.min(self.scroll_max);
        if self.reveal_focus {
            if let Some(target) = self.targets.iter().find(|target| {
                Some(target.id.as_str()) == self.focused.as_deref() && target.id.starts_with("row-")
            }) {
                let y = target.y.saturating_sub(original_top);
                if target.height > self.body.height {
                    self.scroll = (y + 1).min(self.scroll_max);
                } else if y < self.scroll {
                    self.scroll = y;
                } else if y + target.height > self.scroll + self.body.height {
                    self.scroll = (y + target.height)
                        .saturating_sub(self.body.height)
                        .min(self.scroll_max);
                }
            }
            self.reveal_focus = false;
        }
        let buf = frame.buffer_mut();
        for y in 0..body_top {
            for x in 0..area.width {
                buf[(x, y)] = source[(x, y)].clone();
            }
        }
        for y in 0..self.body.height {
            for x in 0..area.width {
                buf[(x, body_top + y)] = source[(x, original_top + self.scroll + y)].clone();
            }
        }
        for (index, y) in footer_rows.iter().enumerate() {
            for x in 0..area.width {
                buf[(x, footer_top + index as u16)] = source[(x, *y)].clone();
            }
        }
        self.targets.retain_mut(|target| {
            if target.id.starts_with("row-") {
                let y =
                    body_top as i32 + target.y as i32 - original_top as i32 - self.scroll as i32;
                let start = y.max(body_top as i32);
                let end = (y + target.height as i32).min(footer_top as i32);
                if end <= start {
                    return false;
                }
                target.y = start as u16;
                target.height = (end - start) as u16;
            } else if target.y >= original_footer {
                let center = target.y + 1;
                if area.height >= 40 {
                    target.y = footer_top + target.y.saturating_sub(original_footer);
                } else if let Some(index) = footer_rows.iter().position(|y| *y == center) {
                    target.y = footer_top + index as u16;
                    target.height = 1;
                } else {
                    target.y = footer_top + target.y.saturating_sub(original_footer);
                    target.height = target.height.min(area.height.saturating_sub(target.y));
                }
            } else if target.y + target.height > body_top {
                return false;
            }
            true
        });
        if self.scroll_max > 0 && self.body.height > 0 {
            let x = self
                .targets
                .iter()
                .filter(|target| target.id.starts_with("row-"))
                .map(|target| target.x + target.width)
                .max()
                .unwrap_or(area.width - 1)
                .min(area.width - 1);
            for y in body_top..footer_top {
                text(buf, Rect::new(x, y, 1, 1), "│", BORDER);
            }
            let thumb_height = ((self.body.height as u32 * self.body.height as u32)
                / (self.body.height + self.scroll_max) as u32)
                .max(1) as u16;
            let thumb = body_top
                + (self.scroll as u32 * self.body.height.saturating_sub(thumb_height) as u32
                    / self.scroll_max as u32) as u16;
            for y in thumb..thumb + thumb_height {
                text(buf, Rect::new(x, y, 1, 1), "┃", PRIMARY);
            }
        }
        self.virtual_terminal = Some(virtual_terminal);
    }
    fn render_full(&mut self, frame: &mut Frame) {
        self.targets.clear();
        let mut area = frame.area();
        if let Some(height) = self.viewport_height {
            area.height = area.height.min(height);
        }
        let buf = frame.buffer_mut();
        Block::default()
            .style(Style::default().bg(BG).fg(FG))
            .render(area, buf);
        let padding = Self::padding(area.width);
        let shell = Rect::new(padding, 1, area.width.saturating_sub(padding * 2), 1);
        if self.show_launch_command {
            let fallback = format!("$: {}", terminal_command("https://avdeyev.dev"));
            let command = if self.launch_command.is_empty() {
                &fallback
            } else {
                &self.launch_command
            };
            let command_height = lines(command, shell.width);
            wrapped(
                buf,
                Rect::new(shell.x, 1, shell.width, command_height),
                command,
                PRIMARY,
            );
        }
        for (i, (x, y)) in [
            (20, 40),
            (70, 20),
            (80, 60),
            (30, 20),
            (70, 80),
            (10, 70),
            (30, 80),
            (90, 30),
        ]
        .iter()
        .enumerate()
        {
            text(
                buf,
                Rect::new(area.width * x / 100, 58 * y / 100, 1, 1),
                if i % 2 == 0 { "+" } else { "·" },
                Color::Rgb(65, 79, 25),
            );
        }
        let (logo_width, logo_height, top) = self.identity_geometry(area.width);
        wordmark(
            buf,
            Rect::new((area.width - logo_width) / 2, top, logo_width, logo_height),
            &self.content.bitmap,
        );
        centered(
            buf,
            Rect::new(0, top + logo_height + 2, area.width, 1),
            "IVAN AVDEYEV / FRONTEND DEVELOPER",
            FG,
        );
        centered(
            buf,
            Rect::new(0, top + logo_height + 4, area.width, 1),
            "Frontend ends. Curiosity doesn't.",
            MUTED,
        );
        let section_width = 94.min(area.width.saturating_sub(padding * 2));
        let section_x = (area.width - section_width) / 2;
        let tabs_y = top + logo_height + 6;
        let tabs_width = section_width.max(32).min(area.width);
        let tabs_area = Rect::new((area.width - tabs_width) / 2, tabs_y, tabs_width, 1);
        SectionTabs {
            active: self.tab,
            focused: self.keyboard
                && self.focused.as_deref() == Some(format!("tab-{}", self.tab).as_str()),
        }
        .render(tabs_area, buf);
        for (index, (label, offset, width)) in
            SectionTabs::positions(tabs_width).into_iter().enumerate()
        {
            let start =
                tabs_area.x + tabs_width.saturating_sub(if tabs_width < 35 { 32 } else { 35 }) / 2;
            self.targets.push(Target::new(
                format!("tab-{index}"),
                label.into(),
                String::new(),
                Rect::new(start + offset, tabs_y - 1, width, 3),
            ));
        }
        let mut y = tabs_y + 3;
        let items = match self.tab {
            0 => &self.content.links,
            1 => &self.content.projects,
            _ => &[] as &[Item],
        };
        let row_width = if self.tab == 0 {
            61.min(section_width)
        } else {
            section_width
        };
        for (i, item) in items.iter().enumerate() {
            let row = NavigationItem {
                title: &item.title,
                detail: &item.detail,
                description: if self.tab == 0 { "" } else { &item.description },
                meta: &item.meta,
                framed: self.framed && self.selected == i,
                email: item.url.starts_with("mailto:"),
            };
            let height = row.height(row_width);
            let rect = Rect::new((area.width - row_width) / 2, y, row_width, height);
            row.render(rect, buf);
            self.targets.push(Target::new(
                format!("row-{i}"),
                item.title.clone(),
                item.url.clone(),
                rect,
            ));
            y += height;
        }
        if self.tab == 2 {
            text(
                buf,
                Rect::new(section_x, y, section_width, 1),
                "Hello, I’m Ivan.",
                FG,
            );
            y += 2;
            for paragraph in &self.content.about {
                let height = lines(paragraph, section_width);
                wrapped(
                    buf,
                    Rect::new(section_x, y, section_width, height),
                    paragraph,
                    MUTED,
                );
                y += height + 2;
            }
            let height = lines(&self.content.skills, section_width);
            wrapped(
                buf,
                Rect::new(section_x, y, section_width, height),
                &self.content.skills,
                FG,
            );
            y += height + 2;
            let row = NavigationItem {
                title: "Read the full CV",
                detail: "",
                description: "",
                meta: "",
                framed: self.framed,
                email: false,
            };
            let rect = Rect::new(section_x, y, section_width, row.height(section_width));
            row.render(rect, buf);
            self.targets.push(Target::new(
                "row-0".into(),
                "Read the full CV".into(),
                "/cv.pdf".into(),
                rect,
            ));
        }
        let footer_height = StatusBar::height(shell.width);
        let footer = Rect::new(
            padding,
            area.height.saturating_sub(footer_height + 1),
            shell.width,
            footer_height,
        );
        let description_height = self.description_height(shell.width);
        wrapped(
            buf,
            Rect::new(
                padding + 1,
                footer.y.saturating_sub(description_height + 1),
                shell.width.saturating_sub(2),
                description_height,
            ),
            self.description(),
            MUTED,
        );
        StatusBar {
            focused: if self.keyboard {
                self.focused.as_deref()
            } else {
                None
            },
        }
        .render(footer, buf);
        for group in StatusBar::groups(shell.width) {
            if group.id == "copy" || group.id == "help" {
                self.targets.push(Target::new(
                    group.id.into(),
                    if group.id == "copy" {
                        "Copy email"
                    } else {
                        "Keyboard shortcuts"
                    }
                    .into(),
                    String::new(),
                    Rect::new(
                        footer.x + group.rect.x,
                        footer.y + group.rect.y - 1,
                        group.rect.width,
                        3,
                    ),
                ));
            }
        }
    }
}
