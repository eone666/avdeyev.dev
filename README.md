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
| `bun run dev`       | Vite dev server, plus the CV printer in watch mode             |
| `bun run build`     | Client bundle, then the SSR bundle, both into `dist/`          |
| `bun run start`     | Runs the built server (`dist/index.js`) on port 3000           |
| `bun run lint`      | ESLint (`typescript-eslint`)                                   |
| `bun test`          | Bun's test runner                                            |
| `bun run typecheck` | `tsc --noEmit`                                                 |
| `bun run icons`     | Regenerates `app/components/icons.tsx` from `@iconify-json/ri` |
| `bun run cv:pdf`    | Prints the `/cv` route to `public/cv.pdf` (see below)          |
| `bun run dev:site`  | The dev server on its own, without the printer                 |

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

Everything renders on the server. Only two components ship JS:

- `islands/cloud-sky.tsx` — the WebGL scene behind the home and error pages.
  It imports three.js dynamically and only after checking the viewport, so
  narrow screens and Save-Data never fetch that 128 kB at all; what is left is
  the canvas' CSS background.
- `islands/social-share.tsx` — feature-detects `navigator.share`, falls back to
  per-network share links.

### Icons

`app/components/icons.tsx` is generated from `@iconify-json/ri` (Remix Icon) by
`scripts/generate-icons.mjs`. To add an icon, append its name to the `ICONS`
array in that script and run `bun run icons`.

### The CV

The card links to `cv.pdf`, which opens in a new tab. That PDF is printed from
the `/cv` route, so the layout has exactly one source. Nothing is committed:
`public/cv.pdf` is gitignored, and the Docker build prints its own copy with
`apk add chromium` in the builder stage, which the runtime image never sees.

`/cv` itself is not served. A deployed copy would be a second, unlinked version
of the CV for search engines to find, so the route answers only in dev and to
the printer, which sets `CV_PRINT` on the server it starts. Nothing on that page
is for a screen either — it is a print stylesheet with a URL.

`bun run dev` prints it once and then reprints on every change to
`app/components/cv/`, `app/routes/cv.tsx` or `app/style.css`, in about 400 ms.
Reload the tab yourself.

The printer drives an already-installed Chromium over the DevTools protocol
(set `CHROME_PATH` if it cannot find one) rather than pulling in Puppeteer,
which would put a few hundred megabytes of browser in `node_modules` and does
not run on musl anyway. It waits for the fonts rather than sleeping, so its
output is byte-identical between runs, and it fails the build if the result is
not exactly two pages.

## Deployment

Docker, behind the compose file in the repo root (`8000:3000`):

```bash
docker compose up -d --build
```

The SSR bundle inlines its dependencies, so the runtime image carries `dist/`
and nothing else — no `node_modules`.
