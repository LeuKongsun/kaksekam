# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS builder

WORKDIR /workspace

ENV CI=true \
    DISABLE_MEDUSA_ADMIN=true

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

# Copy dependency manifests first so dependency installation remains cached when
# only backend source files change.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backend/package.json apps/backend/package.json

RUN pnpm install --frozen-lockfile --filter @kaksekam/backend...

COPY apps/backend apps/backend

RUN pnpm --filter @kaksekam/backend build

FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=9000 \
    DISABLE_MEDUSA_ADMIN=true

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

COPY --from=builder --chown=node:node /workspace/apps/backend/.medusa/server ./

# Medusa's standalone server package must install dependencies on the target
# platform so native optional packages match Linux AMD64.
RUN pnpm install --prod --no-frozen-lockfile && pnpm store prune

USER node

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:9000/health').then((response) => { if (!response.ok) process.exit(1) }).catch(() => process.exit(1))"

CMD ["pnpm", "start"]
