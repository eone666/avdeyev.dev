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

`bun run build:cv` generates two public artifacts from local sources:

- `/cv.pdf`: a two-page tagged PDF/A-3u CV with an embedded `resume.json`.
- `/resume.json`: the complete machine-readable resume, identical to the attachment.

`cv/resume.json` is the only machine-readable source. It uses documented JSON
Resume fields only and validates against the vendored official schema in
`cv/json-resume.schema.json` (jsonresume/resume-schema commit
`b25e3f4bbafd349c2c5bbaa62602c03c228762db`). Validation additionally rejects
undocumented extension fields even where the upstream schema permits them.
The build does not fetch schemas or GitHub data.

Extended context is preserved in standard fields: work summaries and highlights,
projects linked to employers through `entity`, project descriptions, roles,
keywords, source URLs in highlights, and skill context in the basics summary.
Current employment omits `endDate`; known date precision is retained (`YYYY-MM`
for employment and `YYYY` for education). Profile maintenance uses `meta.version`
and `meta.lastModified`; dated adoption observations remain in project highlights.

The short human-facing work and project descriptions live in
`cv/presentation.json`, while `cv/document.tsx` defines the layout, summary, and
compact skills. Megagroup remains in the complete resume and is omitted from the
visible PDF. Edit the complete resume and presentation together when facts change.

`scripts/build-cv.ts` calls `cv/render.ts` to render the PDF and one associated
JSON file in a single Forme pass. `resume.json` has MIME type `application/json`
and `/AFRelationship /Alternative`. The final-page footer points AI readers to
this attachment. It contains no public-profile link. The old profile artifact is
removed during the build so it cannot be copied into a new deployment.

`cv/check.ts` independently extracts text, links, and attachments using PDF.js.
Every build checks reading order, visible work text, dates, project links, the
final-page attachment note, exact embedded JSON contents, and schema validity.
PDF-lib checks tagging, the associated-file relationship, and PDF/A metadata.
Tests also check the final-page footer clearance. Structural checks do not
replace a full conformance validator; run veraPDF for that:

```sh
verapdf --flavour 3u --format text public/cv.pdf
```

The production build runs the CV build before Vite copies the PDF and JSON into
`dist/`; both routes are reserved for static serving. The site exposes Schema.org
`Person` JSON-LD and an alternate link to `/resume.json`. Generated public files
are gitignored. A deployment is required before updated files are publicly served.

Use `bun run dev:cv` for the Forme live preview on `http://localhost:4242`.
The preview shows layout; `bun run build:cv` creates the distributable PDF with
its attachment. `bun test` covers the generated PDF, complete resume schema,
presentation consistency, JSON-LD serialization, and site logic.

## Deployment

Docker, behind the compose file in the repo root (`8000:3000`):

```bash
docker compose up -d --build
```

The SSR bundle inlines its dependencies, so the runtime image carries `dist/`
and nothing else — no `node_modules`.
