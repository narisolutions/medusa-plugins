import type { PosPluginOptions } from "./types"

export default function PosPlugin(options: PosPluginOptions = {}) {
  return {
    resolve: "@narisolutions/medusa-plugin-pos",
    options: options as Record<string, unknown>,
  }
}

export type { PosPluginOptions }
