import { ContainerRegistrationKeys } from "@medusajs/utils"
import type { MedusaRequest } from "@medusajs/framework"
import type { PosPluginOptions } from "@/types"

type Scope = MedusaRequest["scope"]

const PLUGIN_NAME = "@narisolutions/medusa-plugin-pos"

/**
 * Reads the plugin's options from the resolved config module.
 *
 * Works regardless of how the plugin is registered in `medusa-config.ts`:
 * the object form (`{ resolve, options }`) and the factory form
 * (`PosPlugin({...})`) both end up on `configModule.plugins` with the same
 * `options`, so we look ours up by package name.
 */
export function getPluginOptions(scope: Scope): PosPluginOptions {
  const configModule = scope.resolve(ContainerRegistrationKeys.CONFIG_MODULE)

  const entry = (configModule?.plugins ?? []).find(
    (p: string | { resolve: string }) =>
      (typeof p === "string" ? p : p.resolve) === PLUGIN_NAME
  )

  return (typeof entry === "object" ? (entry.options as PosPluginOptions) : undefined) ?? {}
}
