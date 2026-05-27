import type { PosPluginOptions } from "./types"

let _options: PosPluginOptions = {}

export function getPluginOptions(): PosPluginOptions {
  return _options
}

export default function PosPlugin(options: PosPluginOptions = {}) {
  _options = options
  return {
    resolve: "@narisolutions/medusa-plugin-pos",
    options: options as Record<string, unknown>,
  }
}

export type { PosPluginOptions }
