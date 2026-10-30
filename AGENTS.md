# UI-kit-first workflow

For every UI change, build or update the reusable component first, then compose
it into the page. This is the user's required development strategy.

- Inspect `app/components/` before adding markup. Reuse or extend an existing
  component when it already represents the element being changed.
- A component owns its markup, accessibility semantics, responsive layout, and
  interaction states. Keep Tailwind utility classes in component markup. Use CVA for shared variants.
  `app/style.css` owns only theme tokens, global foundations, and custom variants.
  Pixel values in generated CSS are converted to rem by `config/pixels-to-rem.mjs`
  (1px borders stay unchanged).
- Page components compose UI-kit components and provide content. Do not duplicate
  interactive markup or add page-specific overrides for shared selection frames,
  cursors, spacing, typography, hover, touch/hold, or keyboard focus.
- Use `NavigationItem` for vertically navigable content links in Links, Projects,
  and About. Use `SectionTabs` for tabs and `SkillList` for skill labels.
- Reuse `createInputNavigation` for input-mode behavior. With no visible frame,
  the first up/down or J/K key reveals focus; with a visible frame it moves.
  Left/right and H/L switch tabs immediately. Pointer input disables keyboard
  styling, Shift/text selection stays native, and scroll-generated pointer events
  must not change input mode.
- Verify the shared component in every place it is used. Check mobile widths
  (320, 390, 680, 768), desktop, mouse hover, touch/hold, keyboard focus, and
  transitions between input modes. Confirm consistent frame bounds, cursor,
  content alignment, and spacing without horizontal overflow.
- After UI work, provide a working local preview URL for the user to review.

# UX logic and reuse

Define a screen's interaction rules, states, transitions, keyboard/mouse/touch
behavior, and edge cases before implementing the UI.

- Cohesive UX logic used in only one place may remain together in the screen's
  initializer. A monolithic function alone is not a violation of this workflow.
- Extract reusable functions, controllers, or hooks when behavior is actually
  shared or would otherwise be copied. Do not create abstractions just to split
  a file or anticipate hypothetical reuse.
- Reuse existing behavior and native browser APIs; do not reinvent controls or
  copy selection, focus, shortcut, modal, or input-mode rules between screens.
- This site uses native DOM interaction code. Prefer functions/controllers here;
  do not introduce a framework just to use hooks. In a hook-based stack, reusable
  behavior can live in hooks.
- Reusable controllers should offer listener/timer cleanup and a clear API.

Mobile content rows hide the selection cursor and remove its layout column
consistently across Links, Projects, and About. Desktop rows keep the marker.

# Module layout and public API

- A component or function with multiple implementation, style, helper, or test
  files lives in its own named directory.
- Each directory exposes its public TypeScript API through `index.ts`, using
  explicit named re-exports (and `export type` for public types). Do not use
  `export *` or expose private helpers just because they are in the folder.
- Consumers import from the directory entrypoint, not implementation files.
  Keep private CVA definitions inside the component directory.
- Keep component tests inside the component's directory. Non-component unit
  tests belong beside the function/module they test; shared or integration
  scenarios belong in the repository-root `tests/` directory.
- Do not put unrelated utility or error-page tests in another component's tests.
