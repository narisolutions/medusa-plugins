# medusa-plugins

## What This Repo Is

Yarn workspaces monorepo. Currently one published plugin: `@narisolutions/medusa-plugin-pos` (Medusa v2). Lives under `plugins/medusa-plugin-pos/`.

Package manager: **yarn**. Only the root `yarn.lock` is authoritative — never commit per-package lockfiles.

---

## Release Workflow

Branches flow in this order — never skip steps:

```
develop → staging → main → git tag (v*)
```

1. Merge `develop` into `staging`
2. Merge `staging` into `main`
3. Push a `v*` tag on `main` to trigger the npm publish workflow

---

## Build

```bash
yarn workspace @narisolutions/medusa-plugin-pos build
```

Uses `medusa plugin:build` (not `tsc` directly) followed by `scripts/fix-aliases.js`. The alias script rewrites `@/` imports to relative paths in `.medusa/server/src` because swc leaves them unresolved. Do not revert to `tsc + tsc-alias` — that approach was removed intentionally.

Output lands in `.medusa/server/src/`. `tsconfig` has `rootDir: "."` so the `src/` prefix is preserved in output. `package.json` exports point to `.medusa/server/src/*`.

---

## API Routes

All routes live under `src/api/pos/`:

| Route | Description |
|---|---|
| `GET /pos/health` | Health check |
| `GET /pos/products/:sales_channel_id` | List products for a sales channel |
| `GET /pos/product-by-barcode/:sales_channel_id/:ean` | Lookup by barcode (matches `barcode` field, falls back to `ean`) |

Auth is enforced via `src/api/middlewares.ts` — uses `export default` (not named export). Medusa v2 requires the default export; a named export silently skips auth.

`translations.*` is not in the default field list — it doesn't exist on vanilla Medusa and causes a 500. Opt in via `?custom_fields=`.

---

## GitHub Actions

**CI** (`ci.yml`) — triggers on push to `main` and PRs targeting `main`. Runs install → build → test.

**Publish** (`publish.yml`) — triggers on `v*` tags. Runs install → build → test → `npm publish`. Requires `NPM_TOKEN` secret in repo settings (Settings → Secrets and variables → Actions).

If publish fails with `ENEEDAUTH`, the `NPM_TOKEN` secret is missing or empty — check the secret value in repo settings.

---

## npm Package

- Name: `@narisolutions/medusa-plugin-pos`
- Current version: `0.1.0`
- Registry: https://www.npmjs.com/package/@narisolutions/medusa-plugin-pos

---

## Integration Tests

Live in a **separate repo**: `medusa-pos` at `integration-tests/`. That repo runs a Dockerized Medusa stack (postgres + redis + medusa on `:9000`).

Commands (run from `medusa-pos` root):
```bash
yarn test:env:up
yarn test:env:down
yarn test:env:reset
```

Admin credentials: `admin@example.com` / `supersecret`. Seeds a "POS Channel" sales channel + 5 products with `barcode` set (e.g. `5901234123457`), `ean` is null.

The harness installs the plugin via `npm pack` tarball extracted directly into `node_modules` in the Dockerfile — a plain `npm install` of the tarball hangs forever on Medusa's peer-dep graph.
