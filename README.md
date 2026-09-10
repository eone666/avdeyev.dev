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
| `bun run dev`       | Vite dev server plus Forme's live CV preview                   |
| `bun run dev:site`  | Vite site server on `http://localhost:5173`                    |
| `bun run dev:cv`    | Forme CV preview on `http://localhost:4242`                    |
| `bun run build`     | Builds the site and CV into `dist/`                            |
| `bun run build:site` | Builds the client and SSR bundles into `dist/`                |
| `bun run build:cv`  | Renders the CV into `public/cv.pdf` with the Forme CLI         |
| `bun run start`     | Runs the built server (`dist/index.js`) on port 3000           |
| `bun run lint`      | ESLint (`typescript-eslint`)                                   |
| `bun test`          | Bun's test runner                                               |
| `bun run typecheck` | `tsc --noEmit`                                                 |

## Layout

```
app/
  routes/          file-based routes; _renderer.tsx is the document shell
  components/      server-rendered components
  lib/
  voxel-background-client.ts  conditional WebGL loader
  style.css        Tailwind entry, theme tokens, self-hosted fonts
public/            static assets, copied to dist/ on build
scripts/
  build.mjs        production build orchestration
  dev.mjs          local development orchestration
  capture-*.mjs    visual asset generation
  check-*.mjs      browser-level verification
config/             build plugins and generated-entry helpers
cv/                  standalone Forme source for `cv.pdf`
```

### Client-side code

Everything renders on the server. Only the optional background ships JS:

- `voxel-background-client.ts` — a tiny loader for the WebGL scene behind the home and error pages.
  It imports three.js dynamically and only after checking the viewport, so
  narrow screens and Save-Data never fetch that 128 kB at all; what is left is
  the canvas' CSS background.
  The scene runtime is requested during browser idle time; mobile, Save-Data,
  reduced-motion and hidden tabs do not request it. Sharing links need no JS.

### Icons

Use `<Icon name="mail-line" />` from `app/components/icon.tsx` on the site
and `<PdfIcon name="mail-line" />` from `cv/icon.tsx` in the CV.
Browse names at https://icon-sets.iconify.design/ri/; omit the `ri:` prefix.
The Remix Icon catalogue is bundled locally and literal names are included in the build.

Use literal names (including in arrays and objects), rather than constructing
names at runtime. Invalid names fail with an explicit error.

### The CV

The card links to `/cv.pdf`, which opens in a new tab. Its standalone source is
`cv/document.tsx`, outside the web application. Forme renders that template
directly to PDF through its page-native WASM engine, so no browser, application
route or running server is involved.

`public/cv.pdf` is gitignored. Run `bun run build:cv` to create it with the
Forme CLI. The full `bun run build` renders the CV first, then builds the site;
Vite copies the PDF from `public/` into `dist/`. The Vite configuration reserves
`/cv.pdf` as a static production path.

Use `bun run dev:cv` for Forme's live preview and layout inspector on
`http://localhost:4242`. The regular `bun run dev` starts that preview alongside
the Vite site server.

## Deployment

Docker, behind the compose file in the repo root (`8000:3000`):

```bash
docker compose up -d --build
```

The SSR bundle inlines its dependencies, so the runtime image carries `dist/`
and nothing else — no `node_modules`.
