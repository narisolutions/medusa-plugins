export interface PosPluginOptions {
  defaultCurrencyCode?: string
  rateLimit?: { windowMs: number; max: number }
}
