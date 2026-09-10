# Install dependencies only when needed
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build the client bundle, the SSR server bundle, and the CV PDF
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun run build

# Runtime. The SSR bundle inlines its dependencies, so no node_modules here.
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Bun's entry exports the app rather than calling serve(), so the port comes
# from the environment. 3000 is Bun's default; naming it keeps it overridable.
ENV PORT=3000

# The image already ships an unprivileged `bun` user.
COPY --from=builder --chown=bun:bun /app/dist ./dist

USER bun

EXPOSE 3000

CMD ["bun", "./dist/index.js"]
