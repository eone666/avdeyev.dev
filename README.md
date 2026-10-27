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
| `bun run build:cv`  | Renders the CV and embeds profile JSON and PDF metadata       |
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

`cv/profile.json` holds the public profile: employment, skills, selected projects,
education, languages, and extended project descriptions with source references.
The visible CV reads employment and selected projects from that file. Its compact
skill list is maintained independently in `cv/document.tsx` as `visibleSkills`.
`skills` contains the complete merged CV and public GitHub profile stack with sources;
`projectDetails` includes additional public projects, assignment examples, and
branch-specific implementation details. These sections enrich only the attachment
and metadata, keeping the visible CV compact. Keep release and development-branch
features distinct and include review dates for time-sensitive adoption figures.
Keep the remaining header, summary, education, and language text in
`cv/document.tsx` consistent when updating those details.

After Forme renders the document, `scripts/enrich-cv.mjs` adds PDF title, author,
subject, and skill keywords, and embeds the same JSON as `profile.json` with MIME
type `application/json`. It adds no visible page content. The attachment remains
accessible through PDF readers that support attachments; it is public information.
The Forme live preview shows the page layout; the enriched PDF is produced by
`bun run build:cv`. The build uses local profile data and makes no GitHub requests.

Metadata and attachments provide supplementary context for software that reads
them. Do not rely on an ATS extracting them; essential qualifications belong in
the visible document too. Review factual claims and source references when
editing the profile, and update `reviewedAt` after a new review.

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
