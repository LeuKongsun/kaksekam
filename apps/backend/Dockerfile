# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS builder

WORKDIR /workspace

ENV CI=true \
    DISABLE_MEDUSA_ADMIN=true \
    PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH

RUN corepack enable && \
    corepack prepare pnpm@10.32.1 --activate && \
    pnpm config set fetch-retries 5 && \
    pnpm config set fetch-retry-mintimeout 10000 && \
    pnpm config set fetch-retry-maxtimeout 60000 && \
    pnpm config set network-concurrency 8

# Copy dependency manifests first so dependency installation remains cached when
# only backend source files change.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backend/package.json apps/backend/package.json

RUN --mount=type=cache,id=kaksekam-pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @kaksekam/backend... \
      --store-dir=/pnpm/store

COPY apps/backend apps/backend

RUN pnpm --filter @kaksekam/backend build

# Install the standalone server's production dependencies in the AMD64 builder.
# This reuses packages from the workspace install instead of downloading the
# Medusa dependency graph again in the final image stage.
WORKDIR /workspace/apps/backend/.medusa/server

RUN --mount=type=cache,id=kaksekam-pnpm,target=/pnpm/store \
    pnpm install --prod --no-frozen-lockfile --store-dir=/pnpm/store

FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=9000 \
    DISABLE_MEDUSA_ADMIN=true

COPY --from=builder --chown=node:node /workspace/apps/backend/.medusa/server ./

USER node

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:9000/health').then((response) => { if (!response.ok) process.exit(1) }).catch(() => process.exit(1))"

CMD ["npm", "run", "start"]
