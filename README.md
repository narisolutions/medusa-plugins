# medusa-plugins

A monorepo of [Medusa v2](https://medusajs.com) plugins by [Nari Solutions](https://github.com/narisolutions), managed with Yarn workspaces.

## Plugins

| Package | Description |
|---|---|
| [`@narisolutions/medusa-plugin-pos`](plugins/medusa-plugin-pos) | Product endpoints any POS app needs — context-calculated prices, live stock per variant, and configurable field selection. |

See each plugin's own README for installation, configuration, and API details.

## Repo layout

```
plugins/   published Medusa plugins (one package each)
packages/  shared internal packages (if any)
```

## Development

```bash
yarn install      # install all workspace deps
yarn build        # build every workspace
yarn test         # test every workspace
```

To work on a single plugin, `cd` into its directory under `plugins/` and use its own scripts (`build`, `dev`, `test`).

## License

Apache-2.0
