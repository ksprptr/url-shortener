# URL Shortener

> A privacy-friendly URL shortener. Pick how long a link lives — an hour, a week, forever — share it,
> and manage every link you ever made from a small admin.

- [Features](#features)
- [Projects](#projects)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Run](#run)
- [How it works](#how-it-works)
- [Deployment](#deployment)
- [License](#license)

## Features

- Shorten any http(s) URL from the landing page, with a chosen lifetime (hour → year, or never)
- Nothing about a visitor is recorded — no address, no user agent, no referrer, no cookie. A link
  keeps a click counter and a per-day total, and that is the whole history
- A lightweight admin: totals, a 30-day clicks chart, the most-visited links, and a searchable,
  sortable, paged table with create / edit / disable / delete
- Custom slugs, admin notes and absolute expiry dates; reserved slugs can never shadow an app route
- Target URLs are normalized and restricted to `http(s)`, and a link can't point back at the app
- Single-operator auth — a short-lived JWT access token plus rotating, DB-backed refresh tokens in
  httpOnly cookies, with reuse detection
- A per-IP daily quota on public shortening (pseudonymous, keyed-hash — no address is stored) on top
  of an IP-keyed rate limiter
- Strict CSP, read-only non-root containers, loopback-bound ports

## Projects

| Name                       | Description                                                       |
| -------------------------- | ----------------------------------------------------------------- |
| [web](./apps/web/)         | Next.js front-end — landing page, redirects, admin; the BFF layer |
| [api](./apps/api/)         | NestJS API — links, redirect lookup, stats, operator auth         |
| [types](./packages/types/) | `@url-shortener/types` — the shared API contract between the two  |

## Prerequisites

- Node.js 24+ and pnpm 11+ — only for running the apps natively
- [Docker](https://docs.docker.com/get-started/get-docker/) — required for the database, and the
  simplest way to run the whole stack

## Setup

```bash
pnpm install

cp .env.example .env                        # infrastructure + web (compose reads this)
cp apps/api/.env.example apps/api/.env      # API
cp apps/web/.env.example apps/web/.env      # only for running the web app natively
```

Every variable is documented inline in those `.env.example` files.

Generate the API's signing secret and paste it into `apps/api/.env`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"  # JWT_ACCESS_SECRET
```

`AUTH_PASSWORD` is the password you sign in to the admin with, stored as a **bcrypt hash** (the
plaintext never goes into the env):

```bash
pnpm --filter api exec node -e "import('bcryptjs').then((b) => b.hash('your-password', 12)).then(console.log)"
```

## Run

Everything in Docker (recommended):

```bash
docker compose up -d --build   # http://localhost:3000
docker compose logs -f url-shortener-web
docker compose down            # volumes keep your data
```

Migrations run automatically — the one-shot `url-shortener-migrate` service applies them and the API waits
for it.

Natively, with only the infrastructure in Docker:

```bash
docker compose up -d url-shortener-pg url-shortener-redis
pnpm --filter api run prisma:generate
pnpm --filter api run prisma:migrate:deploy
pnpm dev                       # api :4000, web :3000
```

Checks:

```bash
pnpm build && pnpm lint && pnpm test
```

## How it works

| Route              | What happens                                                                     |
| ------------------ | -------------------------------------------------------------------------------- |
| `/`                | The public form. Posts to the API through a Server Action                        |
| `/<slug>`          | Resolved server-side, the visit is counted, the browser is redirected            |
| `/logo`            | The mark, at a few sizes, and the SVG to download                                |
| `/login`, `/admin` | Operator-only; gated by `proxy.ts`, which also refreshes the token before render |

The browser never talks to the API — every call is server-to-server from the Next server, which
forwards the httpOnly auth cookies and the real client IP. In Docker the API is only reachable over
the compose network.

Expired and disabled links answer `410`, not `404`, and the visitor gets a page explaining which of
the two happened. An unknown slug is a plain `404`.

## Deployment

| Description | Values                   |
| ----------- | ------------------------ |
| **Server:** | Coolify                  |
| **URL:**    | https://url.ksprptr.dev/ |

`APP_URL` is baked into the prerendered SEO metadata at build time, so set it as a **build-time**
variable as well as a runtime one, and keep the two identical.

## License

> This software is developed by **Petr Kašpar** and is licensed for non-commercial use only.
> Commercial use is prohibited without permission.
> For more details, please refer to the [LICENSE](./LICENSE) file.
