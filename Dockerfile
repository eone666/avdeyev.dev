# Dependencies change independently of the CV and website source code.
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# PDF generation is cached separately from website changes.
FROM deps AS cv
COPY tsconfig.json ./
COPY cv/ ./cv/
COPY shared/icons.ts shared/resume.ts shared/resume-validation.ts ./shared/
COPY scripts/build-cv.ts ./scripts/
RUN bun run build:cv

# Copy only inputs needed to export the website. Documentation and design
# sources (assets/) do not invalidate either build stage.
FROM deps AS builder
COPY tsconfig.json vite.config.ts postcss.config.mjs ./
COPY config/client-build.ts config/pixels-to-rem.mjs ./config/
COPY app/ ./app/
COPY shared/resume.ts shared/site.ts ./shared/
COPY cv/resume.json ./cv/
COPY scripts/export-static.tsx ./scripts/
COPY public/ ./public/
COPY --from=cv /app/public/cv.pdf /app/public/resume.json ./public/
RUN bun run build:site

# Scratch-based server: only its static binary, configuration, and exported files.
FROM ghcr.io/static-web-server/static-web-server:2.44.1 AS runner
COPY --from=builder /app/dist /public
COPY config/static-web-server.toml /etc/sws.toml
ENV SERVER_CONFIG_FILE=/etc/sws.toml
USER 65532:65532
EXPOSE 3000
