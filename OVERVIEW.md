# medusa-plugin-pos — Project Overview

## What it is

A backend plugin for [Medusa v2](https://medusajs.com) that adds optimized API endpoints for the **Wineland POS** desktop app.

Without it, the POS app talks to Medusa's generic admin API — which is slow and returns too much unnecessary data. With it, the POS gets its own fast, purpose-built endpoints.

---

## How it fits together

```
┌─────────────────────────────────┐
│        Wineland POS App         │  ← Tauri desktop app (medusa-pos)
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
yarn add medusa-plugin-pos
```

```ts
// medusa-config.ts
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

## Current status

| Item | Status |
|---|---|
| Plugin source code | Done |
| Integration test (Docker) | Done, passes |
| Manually tested on dev server | Done |
| Published to npm | Pending |
| README | Done |

Next step: publish to npm so any Medusa store can install it with `yarn add medusa-plugin-pos`.
