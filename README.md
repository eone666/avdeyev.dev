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

`bun run build:cv` generates three gitignored public artifacts:

- `/cv.pdf`: a tagged PDF/A-3u document with embedded fonts, a visible profile URL,
  and two associated JSON files.
- `/profile.json`: the complete extended profile, identical to the attachment.
- `/resume.json`: a JSON Resume projection validated against the official schema.

The full `bun run build` generates these artifacts first, then Vite copies them
into `dist/`. All three paths are reserved for static serving in production.
A deployment is required before updated files become available at avdeyev.dev.

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

`scripts/build-cv.ts` uses the Forme API to render PDF and attachments together.
`cv/render.ts` attaches `profile.json` as `Supplement` and `resume.json` as
`Alternative`, both with MIME type `application/json`. The native generator adds
catalog `/AF` relationships, attachment metadata, Unicode mappings, embedded
Liberation Mono fonts, and PDF/A-3u XMP identification. The metadata subject
contains the extended summary, profile version, public URL, and skill names.
No post-render PDF mutation is used.

`cv/check.ts` uses PDF.js to independently extract page text, hyperlinks, and
attachments. Every build checks work history order, companies, date ranges,
complete visible work bullets, project links, the public JSON link, exact
attachment contents, and JSON Resume validity. PDF-lib checks the tagged
structure and Associated File relationships. This structural check is not a
substitute for a full PDF/A validator. To validate a generated file with veraPDF:

```sh
verapdf --flavour 3u --format text public/cv.pdf
```

`shared/resume.ts` projects the source profile to JSON Resume and Schema.org
`Person`. The website includes JSON-LD and alternate links to both JSON formats.
`cv/json-resume.schema.json` is vendored from jsonresume/resume-schema at commit
`b25e3f4bbafd349c2c5bbaa62602c03c228762db`; its pinned URL is emitted as `$schema`.
The normal build validates locally and requires no GitHub access.

The Forme live preview shows the page layout; `bun run build:cv` produces the
public artifacts and embedded data.

Metadata and attachments provide supplementary context for software that reads
them. Do not rely on an ATS extracting them; essential qualifications belong in
the visible document too. Review factual claims and source references when
editing the profile, and update `reviewedAt` after a new review.

Profile version 2 uses ISO 8601 dates at the known precision: `YYYY-MM` for
employment, `YYYY` for education, and `YYYY-MM-DD` for review dates. A null work
`endDate` means the position is current. Locations use English city names,
ISO 3166-1 alpha-2 `countryCode` values, and English country names. Remote work
has `remote: true` and a null location rather than a fictional city. Languages
include ISO 639-1 `code` values. The CV formats these values for human readers.

Profile version 3 retains those date and location conventions and adds:

- `work[].projects`: project context, individual role, confirmed technologies,
  contributions, and qualitative outcomes where known. Empty technology lists
  mean that the project-specific stack has not been confirmed.
- `work[].testing`: confirmed test types and context, without inferring tools
  from the general skill list.
- `technologyAliases`: canonical technology names mapped to alternative names.
- `skills[].experienceRefs`: local JSON Pointer references to relevant work or
  public project entries. These provide group-level context, not a claim that
  every keyword in a group was used in every referenced entry.
- `adoption.downloadsLowerBound`: a numeric conservative download count;
  `observedDisplay` and `checkedAt` preserve the original observation.

`reviewedAt` tracks profile review, while `profileVersion` tracks the format.
Project adoption observations retain their own dates. `bun test cv/` checks date
conventions, skill uniqueness, local references, selected project consistency,
and the visible CV layout. `bun test` also validates the standard export,
JSON-LD serialization, PDF text extraction, hyperlinks, and attached data.

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
