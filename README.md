# avdeyev.dev

Terminal-style personal link hub and CV at [avdeyev.dev](https://avdeyev.dev).

Built with HonoX (Hono + Vite), TypeScript, plain CSS, and Bun. The site uses
server-rendered HTML with a small client module for interactions. React is used
only by the standalone Forme PDF template.

## Getting started

```sh
bun install
bun run dev        # website at http://localhost:5173, CV preview at :4242
```

## Scripts

| Script | Purpose |
| --- | --- |
| `bun run dev` | Website and Forme preview together |
| `bun run dev:site` | Website development server |
| `bun run dev:cv` | Forme layout preview |
| `bun run build` | Generate PDF/JSON, then build the website |
| `bun run build:site` | Build client assets and SSR server |
| `bun run build:cv` | Render PDF with attached JSON Resume |
| `bun run start` | Serve `dist/index.js` on port 3000 |
| `bun run typecheck` | TypeScript checks |
| `bun run lint` | ESLint checks |
| `bun test` | Site and CV tests |

## Website

- `app/components/terminal-home.tsx`: server-rendered menu, ASCII wordmark,
  descriptions, and dialog content. Main links work with JavaScript disabled.
- `shared/site.ts`: link destinations and project descriptions.
- `app/terminal-client.ts`: menu selection, shortcuts, tabbed sections, clipboard
  feedback, and shared keyboard/pointer input handling. No hydration framework is shipped.
- `app/lib/terminal.ts`: ASCII text rendering and physical-key normalization.
- `app/style.css`: responsive layouts, self-hosted Geist Mono, and the original
  lime-green palette (`oklch(0.93 0.24 120)`). No external font requests.
- `app/routes/_renderer.tsx`: metadata, JSON-LD, and asset loading.

Desktop controls: ↑/↓ or J/K navigate links; ←/→ or H/L switch sections.
Enter activates a link, C copies the email address, and ? opens keyboard help.
Escape closes help.
On touch devices, keyboard hints and hover descriptions are hidden;
tabs and larger link targets support touch navigation.

There is no command input, planet, or WebGL background.

The 404 and 500 pages use the same terminal style. The client also handles return-link keyboard navigation on error pages. The former voxel scene, generated fallback
images, Tailwind components, bitmap-font presentation, and associated capture
scripts and dependencies have been removed.

## Layout

```text
app/         routes, terminal components, client interactions, CSS
shared/      public link data, JSON-LD, resume helpers, CV icon catalogue
cv/          JSON Resume source, PDF presentation, rendering and extraction tests
public/      brand icons, robots/sitemap, generated PDF and resume JSON
config/      Vite client build and Bun static-serving helpers
scripts/     development and production build orchestration
```

### CV icons

Use `<PdfIcon name="mail-line" />` from `cv/icon.tsx` (Remix Icon names without
`ri:`). `shared/icons.ts` reads the local catalogue; SVG paths are normalized for
Forme's renderer. Site navigation uses text rather than icon assets.

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

## Docker

```sh
docker compose up -d --build
```

The standalone Compose file serves the site at `http://localhost:8000`.
The multi-stage image generates `cv.pdf` and `resume.json` during the build;
only the production bundle and generated public files enter the runtime image.

This repository is also included as the `links/` submodule in
`eone666/homelab-docker`. Use that repository's `./up.sh` to update the
homelab checkout, fetch this site's latest `main`, and deploy the full Compose stack.
