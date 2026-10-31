//! Shared terminal UI kit. All sections use the same row geometry and states.
use ratatui::{
    buffer::Buffer,
    layout::Rect,
    style::{Color, Style},
    text::{Line, Span},
    widgets::{Block, Borders, Paragraph, Widget, Wrap},
};
use unicode_width::UnicodeWidthStr;

pub const BG: Color = Color::Rgb(4, 4, 3);
pub const FG: Color = Color::Rgb(250, 250, 250);
pub const PRIMARY: Color = Color::Rgb(213, 253, 0);
pub const MUTED: Color = Color::Rgb(143, 143, 143);
pub const BORDER: Color = Color::Rgb(41, 41, 41);

pub struct StatusGroup {
    pub id: &'static str,
    pub line: Line<'static>,
    pub rect: Rect,
}
pub struct StatusBar<'a> {
    pub focused: Option<&'a str>,
}
impl StatusBar<'_> {
    pub fn groups(width: u16) -> Vec<StatusGroup> {
        let key = |value: &str| Span::styled(format!(" {value} "), Style::default().fg(BG).bg(FG));
        let definitions = [
            (
                "tabs",
                Line::from(vec![
                    key("←→"),
                    Span::raw(" "),
                    key("H L"),
                    Span::raw(" tabs"),
                ]),
            ),
            (
                "select",
                Line::from(vec![
                    key("↑↓"),
                    Span::raw(" "),
                    key("J K"),
                    Span::raw(" select"),
                ]),
            ),
            ("open", Line::from(vec![key("Enter"), Span::raw(" open")])),
            ("copy", Line::from(vec![key("C"), Span::raw(" Copy email")])),
            ("help", Line::from(vec![key("?"), Span::raw(" Help")])),
        ];
        let available = width.saturating_sub(2);
        let total = definitions
            .iter()
            .map(|(_, line)| line.width() as u16)
            .sum::<u16>()
            + 12;
        let mut groups = Vec::new();
        let mut x = 1;
        let mut row = 0;
        for (id, line) in definitions {
            let w = line.width() as u16;
            if total <= available && id == "copy" {
                x = width.saturating_sub(26);
            }
            if x + w > width.saturating_sub(1) && x > 1 {
                row += 1;
                x = 1;
            }
            groups.push(StatusGroup {
                id,
                line,
                rect: Rect::new(x, 1 + row * 2, w, 1),
            });
            x += w + 3;
        }
        groups
    }
    pub fn height(width: u16) -> u16 {
        Self::groups(width).last().map_or(3, |g| g.rect.y + 2)
    }
}
impl Widget for StatusBar<'_> {
    fn render(self, area: Rect, buf: &mut Buffer) {
        Block::default()
            .style(Style::default().bg(BORDER))
            .render(area, buf);
        for group in Self::groups(area.width) {
            let r = Rect::new(
                area.x + group.rect.x,
                area.y + group.rect.y,
                group.rect.width,
                1,
            );
            if self.focused == Some(group.id) {
                Block::default()
                    .borders(Borders::ALL)
                    .border_style(Style::default().fg(PRIMARY))
                    .render(Rect::new(r.x - 1, r.y - 1, r.width + 2, 3), buf);
            }
            Paragraph::new(group.line)
                .style(Style::default().fg(FG))
                .render(r, buf);
        }
    }
}

pub fn text(buf: &mut Buffer, area: Rect, value: &str, color: Color) {
    Paragraph::new(value)
        .style(Style::default().fg(color))
        .render(area, buf);
}

pub fn wrapped(buf: &mut Buffer, area: Rect, value: &str, color: Color) {
    Paragraph::new(value)
        .wrap(Wrap { trim: true })
        .style(Style::default().fg(color))
        .render(area, buf);
}

pub fn lines(value: &str, width: u16) -> u16 {
    Paragraph::new(value)
        .wrap(Wrap { trim: true })
        .line_count(width.max(1)) as u16
}

pub struct NavigationItem<'a> {
    pub title: &'a str,
    pub detail: &'a str,
    pub description: &'a str,
    pub meta: &'a str,
    pub framed: bool,
    pub email: bool,
}

impl NavigationItem<'_> {
    pub fn height(&self, width: u16) -> u16 {
        let inner = width.saturating_sub(10).max(1);
        let title_height = lines(self.title, inner);
        let heading = title_height
            + if !self.detail.is_empty()
                && self.title.width() + self.detail.width() + 2 > inner as usize
            {
                lines(self.detail, inner)
            } else {
                0
            };
        heading
            + 2
            + if self.description.is_empty() {
                0
            } else {
                lines(self.description, inner) + 1
            }
            + if self.meta.is_empty() {
                0
            } else {
                lines(self.meta, inner) + 1
            }
    }
}

impl Widget for NavigationItem<'_> {
    fn render(self, area: Rect, buf: &mut Buffer) {
        let accent = if self.framed { PRIMARY } else { FG };
        Block::default()
            .borders(if self.framed {
                Borders::ALL
            } else {
                Borders::BOTTOM
            })
            .border_style(Style::default().fg(if self.framed { PRIMARY } else { BORDER }))
            .render(area, buf);
        let x = area.x + 6;
        let width = area.width.saturating_sub(10).max(1);
        if self.framed {
            text(buf, Rect::new(area.x + 2, area.y + 1, 2, 1), "›", PRIMARY);
        }
        let title_height = lines(self.title, width);
        wrapped(
            buf,
            Rect::new(x, area.y + 1, width, title_height),
            self.title,
            accent,
        );
        let mut y = area.y + 1 + title_height;
        if !self.detail.is_empty() {
            let separate = self.title.width() + self.detail.width() + 2 > width as usize;
            if separate {
                let height = lines(self.detail, width);
                wrapped(buf, Rect::new(x, y, width, height), self.detail, MUTED);
                y += height;
            } else {
                let dx = x + width.saturating_sub(self.detail.width() as u16);
                text(
                    buf,
                    Rect::new(dx, area.y + 1, self.detail.width() as u16, 1),
                    self.detail,
                    MUTED,
                );
            }
        }
        text(
            buf,
            Rect::new(area.right().saturating_sub(2), area.y + 1, 1, 1),
            if self.email { "✉" } else { "↗" },
            PRIMARY,
        );
        for (value, color) in [(self.description, MUTED), (self.meta, FG)] {
            if !value.is_empty() {
                y += 1;
                let height = lines(value, width);
                wrapped(buf, Rect::new(x, y, width, height), value, color);
                y += height;
            }
        }
    }
}

pub struct SectionTabs {
    pub active: usize,
    pub focused: bool,
}
impl SectionTabs {
    pub fn positions(width: u16) -> [(&'static str, u16, u16); 3] {
        if width < 35 {
            [
                ("[ Links ]", 0, 9),
                ("[ Projects ]", 10, 12),
                ("[ About ]", 23, 9),
            ]
        } else {
            [
                ("[ Links ]", 0, 9),
                ("[ Projects ]", 11, 12),
                ("[ About ]", 25, 9),
            ]
        }
    }
}
impl Widget for SectionTabs {
    fn render(self, area: Rect, buf: &mut Buffer) {
        text(buf, area, &"─".repeat(area.width as usize), BORDER);
        let start = area.x
            + area
                .width
                .saturating_sub(if area.width < 35 { 32 } else { 35 })
                / 2;
        for (index, (label, offset, width)) in Self::positions(area.width).into_iter().enumerate() {
            let x = start + offset;
            if self.focused && index == self.active {
                Block::default()
                    .borders(Borders::ALL)
                    .border_style(Style::default().fg(PRIMARY))
                    .render(
                        Rect::new(
                            x.saturating_sub(1),
                            area.y - 1,
                            (width + 2).min(buf.area.right().saturating_sub(x.saturating_sub(1))),
                            3,
                        ),
                        buf,
                    );
            }
            text(
                buf,
                Rect::new(x, area.y, width, 1),
                label,
                if index == self.active { PRIMARY } else { MUTED },
            );
        }
    }
}

pub fn centered(buf: &mut Buffer, area: Rect, value: &str, color: Color) {
    Paragraph::new(Line::from(value))
        .centered()
        .style(Style::default().fg(color))
        .render(area, buf);
}

/// Pack the original bitmap exactly; never drop source columns or rows.
/// Narrow views use Unicode quadrant blocks (two by two source pixels per cell).
pub fn wordmark(buf: &mut Buffer, area: Rect, bitmap: &[String]) {
    let pixels: Vec<Vec<char>> = bitmap.iter().map(|row| row.chars().collect()).collect();
    let source_width = pixels.first().map_or(0, Vec::len);
    if source_width == 0 {
        return;
    }
    let packed = (area.width as usize) < source_width;
    let step = if packed { 2 } else { 1 };
    let quads = [
        " ", "▘", "▝", "▀", "▖", "▌", "▞", "▛", "▗", "▚", "▐", "▜", "▄", "▙", "▟", "█",
    ];
    let on = |x: usize, y: usize| {
        pixels
            .get(y)
            .and_then(|row| row.get(x))
            .is_some_and(|ch| *ch != ' ')
    };
    for y in 0..area.height {
        for x in 0..area.width {
            let sx = x as usize * step;
            let sy = y as usize * step;
            let bits = if packed {
                (on(sx, sy) as usize)
                    | ((on(sx + 1, sy) as usize) << 1)
                    | ((on(sx, sy + 1) as usize) << 2)
                    | ((on(sx + 1, sy + 1) as usize) << 3)
            } else {
                if on(sx, sy) {
                    15
                } else {
                    0
                }
            };
            let cell = &mut buf[(area.x + x, area.y + y)];
            if bits == 15 {
                cell.set_symbol(" ").set_bg(PRIMARY);
            } else {
                cell.set_symbol(quads[bits]).set_fg(PRIMARY).set_bg(BG);
            }
        }
    }
}

pub struct HelpDialog {
    pub native: bool,
}
impl Widget for HelpDialog {
    fn render(self, area: Rect, buf: &mut Buffer) {
        Block::default()
            .style(Style::default().bg(BG))
            .borders(Borders::ALL)
            .border_style(Style::default().fg(PRIMARY))
            .render(area, buf);
        text(
            buf,
            Rect::new(area.x + 2, area.y + 1, area.width.saturating_sub(4), 1),
            "Keyboard shortcuts",
            PRIMARY,
        );
        if !self.native && area.width > 45 {
            text(
                buf,
                Rect::new(area.right() - 15, area.y + 1, 13, 1),
                "[ Esc ] close",
                MUTED,
            );
        }
        let rows = [
            ("← → / H L", "Switch tabs"),
            ("↑ ↓ / J K", "Select a link"),
            ("Enter", "Open selected link"),
            ("C", "Copy email"),
            ("?", "Open this help"),
            ("Esc", "Close help"),
            ("Q / Ctrl-C", "Quit"),
            ("Wheel", "Scroll"),
        ];
        for (index, (keys, action)) in rows
            .iter()
            .take(if self.native { 8 } else { 6 })
            .enumerate()
        {
            let y = area.y + 4 + index as u16 * 2;
            if y >= area.bottom().saturating_sub(1) {
                break;
            }
            text(
                buf,
                Rect::new(area.x + 2, y, 14.min(area.width.saturating_sub(4)), 1),
                keys,
                PRIMARY,
            );
            text(
                buf,
                Rect::new(area.x + 17, y, area.width.saturating_sub(19), 1),
                action,
                MUTED,
            );
        }
    }
}
