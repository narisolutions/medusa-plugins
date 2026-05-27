export const BASE_PRODUCT_FIELDS = [
  "*",
  "images.*",
  "categories.id",
  "categories.name",
  "categories.handle",
  "categories.parent_category.id",
  "categories.parent_category.name",
  "categories.parent_category.handle",
  "tags.id",
  "tags.value",
  "collection.id",
  "collection.title",
  "collection.handle",
  "options.id",
  "options.title",
  "options.values.*",
  "variants.*",
  "variants.options.id",
  "variants.options.value",
  "variants.options.option.id",
  "variants.options.option.title",
  "variants.prices.*",
  "variants.calculated_price.*",
  "variants.images.*",
]

export const BASE_SALES_CHANNEL_PRODUCT_FIELDS = [
  "products_link.product.*",
  "products_link.product.images.*",
  "products_link.product.categories.id",
  "products_link.product.categories.name",
  "products_link.product.categories.handle",
  "products_link.product.categories.parent_category.id",
  "products_link.product.categories.parent_category.name",
  "products_link.product.categories.parent_category.handle",
  "products_link.product.tags.id",
  "products_link.product.tags.value",
  "products_link.product.options.id",
  "products_link.product.options.title",
  "products_link.product.options.values.*",
  "products_link.product.variants.*",
  "products_link.product.variants.options.id",
  "products_link.product.variants.options.value",
  "products_link.product.variants.options.option.id",
  "products_link.product.variants.options.option.title",
  "products_link.product.variants.prices.*",
  "products_link.product.variants.calculated_price.*",
  "products_link.product.variants.images.*",
  "products_link.product.variants.inventory_items.*",
  "products_link.product.variants.inventory_items.inventory.*",
]

export function resolveProductFields(customFields: string[]): string[] {
  const fields = [...BASE_PRODUCT_FIELDS]
  for (const f of customFields) {
    const trimmed = f.trim()
    if (trimmed && !fields.includes(trimmed)) {
      fields.push(trimmed)
    }
  }
  return fields
}

export function resolveSalesChannelProductFields(customFields: string[]): string[] {
  const fields = [...BASE_SALES_CHANNEL_PRODUCT_FIELDS]
  for (const f of customFields) {
    const trimmed = f.trim()
    if (!trimmed) continue
    const prefixed = `products_link.product.${trimmed}`
    if (!fields.includes(prefixed)) {
      fields.push(prefixed)
    }
  }
  return fields
}
