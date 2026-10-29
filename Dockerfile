# Build tools and framework dependencies stay in the builder stages.
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Scratch-based server: only its static binary, configuration, and exported files.
FROM ghcr.io/static-web-server/static-web-server:2.44.1 AS runner
COPY --from=builder /app/dist /public
COPY config/static-web-server.toml /etc/sws.toml
ENV SERVER_CONFIG_FILE=/etc/sws.toml
USER 65532:65532
EXPOSE 3000
