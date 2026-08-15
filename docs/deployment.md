# Production Deployment

Kaksekam uses Medusa's default production topology:

- `apps/backend`: Medusa API and Admin UI deployed together on the App server.
- `apps/storefront`: customer-facing Next.js UI deployed to Vercel.
- PostgreSQL and Redis: external services reachable from the App server.

The backend is publicly available over HTTPS. Its API uses the origin directly,
such as `https://api.example.com`, and its bundled Admin UI is available at
`https://api.example.com/app`.

## Backend and Admin on the App server

The root `docker-compose.yml` runs `kongsun/kaksekam-backend:latest` as a Linux
AMD64 container. The image's normal `medusa build` includes both the API server
and the Admin static assets under `.medusa/server`.

Copy the environment example on the App server and replace every example value:

```bash
cp .env.compose.example .env
```

Required production values include:

```env
DATABASE_URL=postgres://...
DATABASE_SSL=false
REDIS_URL=redis://...
JWT_SECRET=<strong-random-secret>
COOKIE_SECRET=<different-strong-random-secret>
COOKIE_SECURE=true

STORE_CORS=https://store.example.com
ADMIN_CORS=https://api.example.com
AUTH_CORS=https://store.example.com,https://api.example.com
```

Do not set `DISABLE_MEDUSA_ADMIN=true` in the image build or App-server
environment. The default Admin path is `/app`. `MEDUSA_ADMIN_PATH` can remain
unset in production unless a different path is intentionally required.

PostgreSQL and Redis are external and are not started by Compose. Both services
must be reachable from the App server. Never commit the deployment `.env` file.
Set `DATABASE_SSL=false` only when PostgreSQL is reached over a trusted private
network or encrypted tunnel and the server does not support TLS. For a
TLS-enabled PostgreSQL server with a trusted certificate, set it to `true`.

`REDIS_URL` is wired into Medusa's project configuration. This removes the
`redisUrl not found` fallback when the URL is present and reachable. The current
application still uses local event-bus and in-memory locking providers; keep a
single backend replica until dedicated Redis-backed providers are configured.

For the normal HTTPS deployment, keep `COOKIE_SECURE=true`. If Admin must be
tested temporarily through a plain HTTP IP address, set `COOKIE_SECURE=false`
and use that exact HTTP origin in `ADMIN_CORS` and `AUTH_CORS`. Restore secure
cookies as soon as the backend has an HTTPS domain.

## Linux AMD64 image

Build the production image from the repository root:

```bash
docker build \
  --platform=linux/amd64 \
  --file apps/backend/Dockerfile \
  --tag kongsun/kaksekam-backend:latest \
  .
```

The runner installs the standalone server's production dependencies with pnpm
without a cache mount, ensuring `node_modules` is written into the final image.
The container runs as the unprivileged `node` user and exposes a health check at
`/health`.

Do not copy `node_modules` from a developer machine into the image. The root
`.dockerignore` excludes local dependencies, builds, and environment files.

## Database migrations

Run migrations as a controlled one-off release step before starting the new
backend version. Do not run them independently in every API replica.

```bash
docker compose stop backend
docker compose run --rm --no-deps \
  backend \
  pnpm exec medusa db:migrate --execute-safe-links
docker compose up -d backend
```

Only one migration process should run at a time. Back up databases containing
important data before applying new migrations.

## Deploy the backend

After the image has been built and pushed:

```bash
docker compose pull backend
docker compose up -d backend
docker compose logs --tail=200 backend
```

Verify both surfaces:

```text
https://api.example.com/health
https://api.example.com/app
```

The health endpoint should return `OK`, and `/app` should show the Medusa Admin
login screen.

## Storefront on Vercel

Create one Vercel project from this repository with these settings:

```text
Root Directory: apps/storefront
Framework Preset: Next.js
Build Command: pnpm build
Output Directory: leave empty
Install Command: pnpm install --frozen-lockfile
```

Set at least:

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.example.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_BASE_URL=https://store.example.com
```

Seller onboarding links automatically open the bundled Admin at
`NEXT_PUBLIC_MEDUSA_BACKEND_URL/app`.

## Deployment order

1. Back up the database when appropriate.
2. Build and push the Linux AMD64 backend image.
3. Run database migrations once.
4. Start the backend and verify `/health` and `/app`.
5. Deploy the storefront to Vercel.
6. Update CORS values whenever the production storefront or API origin changes.

Vercel preview deployments that call the production API need their exact origins
added to CORS. Avoid unrestricted wildcard CORS for authenticated routes.
