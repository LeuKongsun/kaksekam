# Split UI and API Deployment

Kaksekam can deploy its two browser applications to Vercel while running the
Medusa API on a persistent server in a VPC.

## Architecture

- `apps/storefront`: customer-facing Next.js UI on Vercel.
- `apps/backend`: static Medusa Admin UI built separately for Vercel.
- Medusa server: API-only deployment in the VPC.
- PostgreSQL and Redis: infrastructure used by the Medusa server, not by the
  browser applications directly.

The VPC API must have a public HTTPS endpoint that both browser applications
can reach, such as `https://api.example.com`.

## Medusa API in the VPC

Build and run the backend as a persistent Node.js application. Set these
environment variables using the final deployment domains:

```env
DATABASE_URL=postgres://...
REDIS_URL=redis://...
JWT_SECRET=<strong-random-secret>
COOKIE_SECRET=<strong-random-secret>

STORE_CORS=https://store.example.com
ADMIN_CORS=https://admin.example.com
AUTH_CORS=https://store.example.com,https://admin.example.com

DISABLE_MEDUSA_ADMIN=true
```

`DISABLE_MEDUSA_ADMIN=true` prevents the API deployment from building and
serving a duplicate Admin UI. Run database migrations as part of the VPC
deployment before starting the new application version.

### Linux AMD64 container

The production API image uses Node.js 20 on Debian and installs its runtime
dependencies inside the Linux image. This is important because packages such
as SWC, esbuild, Rollup, and Sharp select binaries based on the operating
system, CPU architecture, and C library.

Build the image from the repository root:

```bash
docker build \
  --platform=linux/amd64 \
  --file apps/backend/Dockerfile \
  --tag kaksekam-api:latest \
  .
```

Do not copy `node_modules` from a developer machine or from a different CPU
architecture into the image. The root `.dockerignore` excludes local dependency
and build directories for this reason.

Run the container using secrets supplied by the VPC deployment platform:

```bash
docker run --rm \
  --platform=linux/amd64 \
  --publish 9000:9000 \
  --env-file /secure/path/kaksekam-api.env \
  kaksekam-api:latest
```

The image runs as the unprivileged `node` user and exposes a container health
check against `/health`. It does not embed an `.env` file or the Medusa Admin.
The build stages share a BuildKit pnpm cache and use retry backoff with reduced
registry concurrency. Production dependencies are installed in the AMD64
builder and copied into the final image, so the final image stage performs no
package-registry requests. This reduces clean-build failures caused by npm
registry `429 Too Many Requests` responses.

Run migrations as a separate release step before switching traffic to the new
image. Do not run migrations independently in every replica during startup.

### Docker Compose on the app server

The root `docker-compose.yml` runs
`kongsun/kaksekam-backend:latest` as a Linux AMD64 API container. PostgreSQL
and Redis are external services and are not started by Compose. On the app
server, copy the example environment file and replace all example values:

```bash
cp .env.compose.example .env
docker compose pull backend
docker compose up -d
```

Compose refuses to start the backend when its PostgreSQL URL, Redis URL,
authentication secrets, or CORS origins are missing. Both external services
must be reachable from the App server before the backend starts. The deployment
`.env` file must remain uncommitted.

The API image does not run database migrations automatically. Run the Medusa
migration command as a controlled release step before updating the backend
container, especially when more than one API replica may be running.

## Storefront on Vercel

Create a Vercel project with `apps/storefront` as its root directory. It uses
the standard Next.js build.

Set at least:

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.example.com
NEXT_PUBLIC_MEDUSA_ADMIN_URL=https://admin.example.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
```

The Admin URL is used by seller onboarding links. If it is omitted during
local development, the storefront falls back to the combined Medusa URL at
`http://localhost:9000/app`.

## Admin UI on Vercel

Create a second Vercel project with `apps/backend` as its root directory.

Use these project settings:

```text
Build command: pnpm build:admin
Output directory: .medusa/admin
```

Set:

```env
MEDUSA_BACKEND_URL=https://api.example.com
MEDUSA_ADMIN_PATH=/
DISABLE_MEDUSA_ADMIN=false
```

`MEDUSA_BACKEND_URL` and `MEDUSA_ADMIN_PATH` are embedded into the static Admin
bundle during the build. Set them separately for Vercel Production and Preview
environments, then redeploy after changing either value.

Do not expose `DATABASE_URL`, Redis credentials, JWT secrets, or cookie secrets
to either Vercel UI project. The UIs need only public URLs and the storefront's
publishable API key.

## Deployment order

1. Deploy the VPC API and confirm `https://api.example.com/health` returns `OK`.
2. Deploy the Admin UI and confirm login and marketplace routes work.
3. Deploy the storefront and confirm browsing, authentication, saved listings,
   and seller onboarding work.
4. Update the VPC CORS values whenever a production UI domain changes.

For Vercel preview deployments, either use a stable staging domain or add the
specific preview origins to the API's CORS configuration. Avoid unrestricted
wildcard CORS for authenticated routes.
