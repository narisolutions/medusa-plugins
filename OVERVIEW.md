# @narisolutions/medusa-plugin-pos — Project Overview

## What it is

A backend plugin for [Medusa v2](https://medusajs.com) that adds the product endpoints any POS app needs. It started as a request from users of the open-source POS app and is **not store-specific** — anyone running a Medusa-backed POS needs it.

Without these custom endpoints, a POS talking to Medusa's generic API hits two problems: **stock isn't checked automatically** when adding items to a cart, and **prices come back raw — not context-calculated**. The cashier has to verify stock and price by hand.

This plugin fixes both: its `/pos/*` endpoints return live inventory quantities per variant and context-calculated prices (`?currency_code=`), plus a `?custom_fields=` option to choose exactly which product fields you fetch.

It lives in the `medusa-plugins` **monorepo** (Yarn workspaces) under `plugins/medusa-plugin-pos/`, published to npm as `@narisolutions/medusa-plugin-pos`.

---

## How it fits together

```
┌─────────────────────────────────┐
│           POS App               │  ← Tauri desktop app (open-source medusa-pos)
│  (cashier-facing, runs locally) │
└────────────┬────────────────────┘
             │  HTTP requests to /pos/* routes
             ▼
┌─────────────────────────────────┐
│       Medusa v2 Backend         │  ← customer's existing store backend
│                                 │
│  ┌───────────────────────────┐  │
│  │   medusa-plugin-pos       │  │  ← this plugin, installed here
│  │                           │  │
│  │  /pos/products/:sc_id     │  │
│  │  /pos/product-by-barcode  │  │
│  │  /pos/health              │  │
│  └───────────────────────────┘  │
│                                 │
│  Medusa Database (PostgreSQL)   │
└─────────────────────────────────┘
```

---

## What the plugin provides

| Endpoint | Purpose |
|---|---|
| `GET /pos/products/:sales_channel_id` | Fetch all published products for the POS register |
| `GET /pos/product-by-barcode/:sales_channel_id/:ean` | Look up a product by barcode scan |
| `GET /pos/health` | Health check so the POS can verify backend connectivity |

All three endpoints require the cashier to be logged in (admin bearer token). Rate limiting is optional and configurable.

---

## How it is installed (backend side)

A store owner adds one package and one config line to their Medusa backend:

```bash
yarn add @narisolutions/medusa-plugin-pos
```

```ts
// medusa-config.ts
import PosPlugin from "@narisolutions/medusa-plugin-pos"

plugins: [
  PosPlugin({ defaultCurrencyCode: "usd" })
]
```

Restart the backend — done. No database migrations, no extra services.

---

## How a cashier uses it (POS app side)

```
1. Download and install the POS desktop app
2. Enter the store's backend URL on first launch
3. Log in with their Medusa admin account
4. Select their sales channel (register)
5. Settings → Preferences → enable Custom Endpoints
```

After step 5 the app starts using the plugin's fast endpoints for product search and barcode scanning.

---

## Day-to-day usage

Once installed and enabled, the plugin is invisible — the cashier just works:

- **Scan a barcode** → POS calls `GET /pos/product-by-barcode/:sales_channel_id/:ean` and gets the matching product (with price + stock) in one request.
- **Browse / search the register** → POS calls `GET /pos/products/:sales_channel_id` for the channel's published catalog.
- **Connectivity check** → POS pings `GET /pos/health` to confirm the backend is reachable.

Every call carries the cashier's admin bearer token. No per-request setup; the plugin stays in place until uninstalled.

---

## How it's tested after npm publish

Integration tests run against the **published package**, not the local source — proving the build artifact (`.medusa/server`) and `exports` map actually work for a consumer:

1. A throwaway Medusa app installs `@narisolutions/medusa-plugin-pos@<version>` and registers it in `medusa-config.ts`.
2. `@medusajs/test-utils` (`medusaIntegrationTestRunner`) boots a real backend against a Postgres test DB.
3. The test seeds a sales channel + published products, obtains an admin token via `POST /auth/user/emailpass`, then hits each `/pos/*` route and asserts the response shape, prices, stock, and the barcode → `ean` fallback.


This catches packaging mistakes (wrong `files`, bad alias resolution) that unit tests can't, since it consumes the plugin exactly as a store would.

---

## Current status

| Item | Status |
|---|---|
| Plugin source code | Done |
| Monorepo + `@narisolutions` scope | Done |
| API docs (`openapi.yaml`, `docs/endpoints.md`) | Done |
| Local integration test | Done, passes |
| Manually tested on dev server | Done |
| Published to npm | Pending |
| Post-publish integration test | Pending (runs against published package) |

Next step: publish to npm so any Medusa store can install it with `yarn add @narisolutions/medusa-plugin-pos`.
