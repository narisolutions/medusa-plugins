# @narisolutions/medusa-plugin-pos

Medusa v2 plugin that adds optimized POS (Point of Sale) endpoints to your backend. Built by [Nari Solutions](https://github.com/narisolutions).

## Installation

```bash
yarn add @narisolutions/medusa-plugin-pos
```

## Setup

Add the plugin to your `medusa-config.ts`:

```ts
import PosPlugin from "@narisolutions/medusa-plugin-pos"

export default defineConfig({
  plugins: [
    PosPlugin({
      defaultCurrencyCode: "usd", // optional — used when ?currency_code= is omitted
      rateLimit: {               // optional — per-IP rate limiting
        windowMs: 60_000,        // 1 minute window
        max: 100,                // max requests per window
      },
    }),
  ],
})
```

## API Documentation

- [`docs/endpoints.md`](docs/endpoints.md) — endpoint reference with rationale and retirement criteria
- [`openapi.yaml`](openapi.yaml) — OpenAPI 3.1 spec (parameters, schemas, status codes)

## Endpoints

All endpoints require an **admin bearer token** (`Authorization: Bearer <token>`).

### GET `/pos/products/:sales_channel_id`

Returns all published products for a sales channel, with inventory quantities per variant.

| Query param | Type | Description |
|---|---|---|
| `currency_code` | string | Include `calculated_price` for each variant |
| `custom_fields` | string | Comma-separated extra fields to include |

**Response:** array of product objects.

---

### GET `/pos/product-by-barcode/:sales_channel_id/:ean`

Looks up a single product by variant EAN barcode, with inventory quantities.

| Query param | Type | Description |
|---|---|---|
| `currency_code` | string | Include `calculated_price` for each variant |
| `custom_fields` | string | Comma-separated extra fields to include |

**Response:** single product object. Returns `404` if no variant matches the EAN.

---

### GET `/pos/health`

Returns `{ "status": "ok" }`. Requires auth. Use for backend health checks from your POS.

## Authentication

Obtain a bearer token from the Medusa admin auth endpoint:

```
POST /auth/user/emailpass
{ "email": "...", "password": "..." }
```

Use the returned token as `Authorization: Bearer <token>` on all `/pos/*` requests.

## Frontend usage (example)

```ts
const res = await fetch(
  `/pos/products/${salesChannelId}?currency_code=usd`,
  { headers: { Authorization: `Bearer ${token}` } }
)
const products = await res.json()
```

```ts
const res = await fetch(
  `/pos/product-by-barcode/${salesChannelId}/${ean}?currency_code=usd`,
  { headers: { Authorization: `Bearer ${token}` } }
)
const product = await res.json()
```

## Plugin options

| Option | Type | Default | Description |
|---|---|---|---|
| `defaultCurrencyCode` | `string` | `undefined` | Fallback currency code when `?currency_code=` is not passed |
| `rateLimit.windowMs` | `number` | — | Rate limit window in milliseconds |
| `rateLimit.max` | `number` | — | Max requests per IP per window |

## License

Apache-2.0
