<h1 align="center">
  Kaksekam
</h1>

<p align="center">
  Agriculture marketplace for farmers and buyers
</p>

# Kaksekam

A production-ready monorepo for the Kaksekam agriculture marketplace. It supports classifieds-style and two-sided marketplace flows with seller listings, moderation, saved listings, and marketplace account areas. The platform uses Medusa and Next.js as its underlying technology stack.

## Features

- Marketplace listing flows
- Seller dashboard and listing editor
- Moderation routes for listing review
- Telegram, Messenger, and phone contact with privacy-safe click metrics
- Thirty-day listing freshness, buyer reports, and seller verification
- Saved listings
- Multi-region support with automatic country detection
- Customer account areas for buyers and sellers
- Legacy ecommerce flows still exist in the codebase and can be isolated or removed as the platform evolves

## Getting Started

### Deploy

The backend can be deployed with [Medusa Cloud](https://cloud.medusajs.com):

1. Create a cloud account.
2. Deploy the Kaksekam backend from your dashboard.

### Local Installation

> **Prerequisites:
>
> - [Node.js](https://nodejs.org/) v20+
> - [PostgreSQL](https://www.postgresql.org/) v15+
> - [pnpm](https://pnpm.io/) v10+

1. Clone the repository and install dependencies:

```bash
git clone <your-repo-url>
cd kaksekam
pnpm install
```

2. Set up environment variables for the backend:

```bash
cp apps/backend/.env.template apps/backend/.env
```

3. Set the database URL in `apps/backend/.env`:

```bash
# Replace with actual database URL, make sure the database exists.
DATABASE_URL=postgres://kaksekam:kaksekam@localhost:5432/kaksekam
```

4. Run migrations:

```bash
cd apps/backend
pnpm medusa db:migrate
```

5. Add admin user:

```bash
cd apps/backend
pnpm medusa user -e admin@test.com -p supersecret
```

6. Start the Kaksekam backend:

```bash
cd apps/backend
pnpm dev
```

7. Open the admin dashboard at `localhost:9000/app` and log in. Retrieve your publishable API key at Settings > Publishable API key.

8. Set up environment variables for the storefront:

```bash
cp apps/storefront/.env.template apps/storefront/.env.local
```

9. Update `apps/storefront/.env.local` with your backend publishable API key:

```bash
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_6c3...
```

10.  Start storefront:

```bash
cd apps/storefront
pnpm dev
```

The storefront runs on `http://localhost:8000`.

You can also run the following command from the root to start both backend and storefront:

```bash
pnpm dev
```

### Import verified launch partners

Copy `apps/backend/src/migration-scripts/marketplace-launch-data.example.json`
outside the repository or to a private ignored file, replace every example value
with reviewed seller and listing data, then run:

```bash
cd apps/backend
MARKETPLACE_LAUNCH_DATA_PATH=/absolute/path/to/launch-data.json pnpm seed:launch
```

The importer validates that each seller has a working phone, Telegram username,
or Messenger link. Imported sellers remain unverified and listings remain
pending review until an admin checks them. Re-running the importer skips listing
handles that already exist.

### Cambodia V1 launch checklist

Before inviting public buyers:

1. Run marketplace migrations so seller social fields, contact events, reports, and expiry columns exist.
2. Seed 20–30 credible producers and 50–100 current produce/food listings via `pnpm seed:launch`.
3. Verify each seller has Telegram, Messenger, or phone, then approve listings in admin.
4. Confirm listing links render useful Facebook/Telegram previews (`NEXT_PUBLIC_BASE_URL` must be public HTTPS).
5. Start operationally in 1–2 supply areas; keep assisted onboarding by phone/Telegram.

### V1 success checks

Track weekly in admin marketplace metrics:

- Active listings and expired/stale listings
- Contact clicks by channel (Telegram, Messenger, phone)
- Active listing contact rate over 14 days
- Repeat sellers (sellers with more than one listing)

Learning thresholds for the first cohort:

- At least 30% of active listings receive a contact click within 14 days
- At least 40% of onboarded sellers publish again

## Configuration

The storefront is configured via environment variables in `apps/storefront/.env.local`:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Publishable API key from the Kaksekam backend | — |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | URL of the Kaksekam backend | `http://localhost:9000` |
| `NEXT_PUBLIC_MEDUSA_ADMIN_URL` | URL of the separately deployed Medusa Admin UI | `NEXT_PUBLIC_MEDUSA_BACKEND_URL/app` |
| `NEXT_PUBLIC_DEFAULT_REGION` | Default region country code | `dk` |
| `NEXT_PUBLIC_BASE_URL` | Base URL of the storefront | `https://localhost:8000` |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe publishable key (optional) | — |

For production deployment with both UIs on Vercel and the API in a VPC, see
[Split UI and API Deployment](docs/deployment-ui-api-split.md).

## Technology resources

- [Medusa Documentation](https://docs.medusajs.com)
- [Medusa Cloud](https://cloud.medusajs.com)
