# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS builder

WORKDIR /workspace

ENV CI=true \
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

FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=9000

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

COPY --from=builder --chown=node:node /workspace/apps/backend/.medusa/server ./

# Do not use a cache mount for this install. The production dependency files
# must be written into the final image layer.
RUN pnpm install --prod --no-frozen-lockfile

USER node

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:9000/health').then((response) => { if (!response.ok) process.exit(1) }).catch(() => process.exit(1))"

CMD ["pnpm", "start"]
