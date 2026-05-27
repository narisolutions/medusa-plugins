# POS Endpoint Reference

All `/pos/*` endpoints require a Medusa **admin bearer token**:

```
Authorization: Bearer <token>
```

Obtain a token via `POST /auth/user/emailpass`. Rate limiting is applied globally to all `/pos/*` routes when the `rateLimit` plugin option is configured (per-IP, sliding window).

For the full machine-readable spec see [`../openapi.yaml`](../openapi.yaml).

---

## Endpoints

### `GET /pos/health`

Returns `{ "status": "ok" }` immediately without a database query.

**Why this exists:**
The POS app needs to verify backend reachability on startup and after reconnects without a heavy query. Medusa does not expose a lightweight, plugin-scoped health endpoint whose path and behavior are guaranteed stable across minor versions.

**Retirement criteria:**
Remove this endpoint when Medusa exposes a stable, authenticated health endpoint at a fixed path that the POS can target directly, or when the POS app is restructured to check Medusa's own `/health` route without relying on plugin routing.

---

### `GET /pos/products/{sales_channel_id}`

Returns all **published** products linked to the given sales channel. Each variant is enriched with `inventory_quantity` (available stock in this channel). Optionally includes `calculated_price` per variant.

**Path parameters**

| Param | Required | Description |
|---|---|---|
| `sales_channel_id` | Yes | Medusa SalesChannel ID |

**Query parameters**

| Param | Required | Description |
|---|---|---|
| `currency_code` | No | ISO 4217 code (e.g. `usd`). Adds `calculated_price` to each variant. Falls back to `defaultCurrencyCode` plugin option if omitted. |
| `custom_fields` | No | Comma-separated Medusa graph field selectors. Each is prefixed with `products_link.product.` automatically. |

**Response — 200**

JSON array of product objects. Only `status: "published"` products are included. Empty array if none.

Key fields per product:

| Field | Notes |
|---|---|
| `id`, `title`, `handle`, `status`, `thumbnail` | Standard product fields |
| `images[]` | Product-level images |
| `categories[]` | With `parent_category` (one level) |
| `tags[]` | |
| `collection` | id, title, handle |
| `options[]` | With nested `values[]` |
| `variants[]` | See variant fields below |

Key fields per variant:

| Field | Notes |
|---|---|
| `id`, `title`, `sku`, `barcode`, `ean` | Standard variant identifiers |
| `options[]` | Option values with parent option title |
| `prices[]` | All raw prices |
| `calculated_price` | Present only when `currency_code` is resolved |
| `images[]` | Variant-level images |
| `inventory_quantity` | **POS-injected.** Available stock count in this sales channel. Defaults to `0` if no inventory item is linked. Not a native Medusa variant field. |

**Other responses**

| Status | Condition |
|---|---|
| 401 | Missing or invalid bearer token |
| 429 | Rate limit exceeded (only when `rateLimit` plugin option is set) |

**Why this exists:**
Medusa's store API (`/store/products`) does not return `inventory_quantity` on variants. Getting product data + stock counts requires at minimum two separate API calls. This endpoint performs a single graph query for products and a single `getVariantAvailability()` call, delivering a complete product+stock payload in one round-trip. The `calculated_price` inclusion via `QueryContext` is also more ergonomic than the store pricing context pattern.

**Retirement criteria:**
Remove this endpoint when **both** of the following are true:
1. Medusa's store or admin API returns `inventory_quantity` on variant objects natively in a single product list call, scoped to a sales channel.
2. Medusa supports passing a `currency_code` to get `calculated_price` on variants in the same call without a separate pricing context query.

Observable signal: variant response shape in `/store/products` or `/admin/products` changelog; Medusa GitHub — watch for inventory fields added to variant schema.

---

### `GET /pos/product-by-barcode/{sales_channel_id}/{ean}`

Looks up a single product whose variant matches the given barcode or EAN value. Returns the full product with all variants enriched with `inventory_quantity` (and optionally `calculated_price`).

The lookup is a **two-step fallback**: first queries `product_variant` filtered by `barcode = ean`, then by `ean = ean` if the first returns nothing.

The `sales_channel_id` is used only for the inventory availability query — product membership in the sales channel is not verified.

**Path parameters**

| Param | Required | Description |
|---|---|---|
| `sales_channel_id` | Yes | Medusa SalesChannel ID — scopes the inventory count |
| `ean` | Yes | Barcode or EAN value scanned by the POS device |

**Query parameters**

| Param | Required | Description |
|---|---|---|
| `currency_code` | No | ISO 4217 code. Adds `calculated_price` to each variant. |
| `custom_fields` | No | Comma-separated extra field selectors (no auto-prefix). |

**Response — 200**

Single product object. Same shape as the product objects in `/pos/products`, including `inventory_quantity` on each variant.

**Other responses**

| Status | Condition |
|---|---|
| 401 | Missing or invalid bearer token |
| 404 | No variant found with a matching `barcode` or `ean` field |
| 429 | Rate limit exceeded (only when `rateLimit` plugin option is set) |

**Why this exists:**
Medusa has no barcode or EAN lookup endpoint in either the store or admin API. The only path is a direct `product_variant` graph query filtered by `barcode` or `ean`, which is not exposed via any public API surface. The two-step fallback is required because merchants may populate either field depending on their import or PIM workflow, and POS scanners emit EAN-13 or UPC-A codes that may map to either column.

**Retirement criteria:**
Remove this endpoint when Medusa exposes a native barcode/EAN lookup — for example, a `/store/variants?barcode=` or `/admin/product-variants?barcode=` endpoint that resolves variants and their parent products by `barcode` or `ean` in a single call.

Observable signal: Medusa store or admin API changelog; a variant search endpoint accepting `barcode`/`ean` filters.
