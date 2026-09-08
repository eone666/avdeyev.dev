# links

Personal link hub and CV, served at [avdeyev.dev](https://avdeyev.dev).

Built with [HonoX](https://github.com/honojs/honox) (Hono + Vite, `hono/jsx`),
Tailwind CSS v4 and TypeScript, running on Bun. No React.

## Getting started

```bash
bun install
bun run dev        # http://localhost:5173
```

## Scripts

| Script              | What it does                                                   |
| ------------------- | -------------------------------------------------------------- |
| `bun run dev`       | Vite dev server with HMR                                       |
| `bun run build`     | Client bundle, then the SSR bundle, both into `dist/`          |
| `bun run start`     | Runs the built server (`dist/index.js`) on port 3000           |
| `bun run lint`      | ESLint (`typescript-eslint`)                                   |
| `bun test`          | Bun's test runner                                            |
| `bun run typecheck` | `tsc --noEmit`                                                 |
| `bun run icons`     | Regenerates `app/components/icons.tsx` from `@iconify-json/ri` |
| `bun run cv:pdf`    | Prints the `/cv` route to `public/cv.pdf` (see below)          |

## Layout

```
app/
  routes/          file-based routes; _renderer.tsx is the document shell
  islands/         the only client-side JS (see below)
  components/      server-rendered components
    icons.tsx      GENERATED — edit scripts/generate-icons.mjs instead
  lib/
  client.ts        island hydration entry
  style.css        Tailwind entry, theme tokens, self-hosted fonts
public/            static assets, copied to dist/ on build
scripts/
```

### Islands

Everything renders on the server. Only three components ship JS:

- `islands/cloud-sky.tsx` — the WebGL scene behind the home and error pages.
  It imports three.js dynamically and only after checking the viewport, so
  narrow screens and Save-Data never fetch that 128 kB at all; what is left is
  the canvas' CSS background.


- `islands/social-share.tsx` — feature-detects `navigator.share`, falls back to
  per-network share links.
- `islands/scalable-block.tsx` — scales the fixed-width (210mm) CV down to fit
  narrow viewports. It takes a **selector**, not `children`: an island with
  children makes HonoX serialize the whole subtree a second time into a
  `<template>` for hydration, and the CV subtree is two full A4 pages of markup.

### Icons

`app/components/icons.tsx` is generated from `@iconify-json/ri` (Remix Icon) by
`scripts/generate-icons.mjs`. To add an icon, append its name to the `ICONS`
array in that script and run `bun run icons`.

### The CV

The card links straight to `cv.pdf`, which opens in a new tab. That PDF is
printed from the `/cv` route, so the layout has exactly one source.

The Docker build does it on its own — `apk add chromium` in the builder stage,
which the runtime image never sees. Locally:

```bash
bun run build
bun run cv:pdf     # writes public/cv.pdf
```

`/cv` still serves the HTML. Nothing links to it, but it is what gets printed,
so edit `app/components/cv/` and re-run.

The script drives an already-installed Chromium over the DevTools protocol
(set `CHROME_PATH` if it cannot find one) rather than pulling in Puppeteer,
which would put a few hundred megabytes of browser in `node_modules` and does
not run on musl anyway. It fails the build if the result is not exactly two
pages, so a layout that quietly overflows cannot ship.

## Deployment

Docker, behind the compose file in the repo root (`8000:3000`):

```bash
docker compose up -d --build
```

The SSR bundle inlines its dependencies, so the runtime image carries `dist/`
and nothing else — no `node_modules`.
