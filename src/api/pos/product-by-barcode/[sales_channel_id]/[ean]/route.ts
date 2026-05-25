

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  getVariantAvailability,
  MedusaError,
  QueryContext,
} from "@medusajs/utils"

import { resolveProductFields } from "../../../../../utils/product-fields"
import { parsePosQueryParams } from "../../../../../utils/query-params"
import { getPluginOptions } from "../../../../../index"

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const { sales_channel_id, ean } = req.params
  const { currency_code: qsCurrency, custom_fields } = parsePosQueryParams(req)
  const currency_code = qsCurrency ?? getPluginOptions().defaultCurrencyCode
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [byBarcode] } = await query.graph({
    entity: "product_variant",
    filters: { barcode: ean },
    fields: ["product_id"],
  })
  let variant = byBarcode
  if (!variant?.product_id) {
    const { data: [byEan] } = await query.graph({
      entity: "product_variant",
      filters: { ean },
      fields: ["product_id"],
    })
    variant = byEan
  }

  if (!variant?.product_id) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Product with barcode ${ean} not found.`
    )
  }

  const fields = resolveProductFields(custom_fields)

  const context = currency_code
    ? { variants: { calculated_price: QueryContext({ currency_code }) } }
    : {}

  const { data: [product] } = await query.graph(
    {
      entity: "product",
      filters: { id: variant.product_id },
      fields,
      context,
    },
    { cache: { enable: true, autoInvalidate: true } }
  )

  const variant_ids = (product?.variants ?? []).map((v: any) => v.id)
  const quantities = await getVariantAvailability(query, { variant_ids, sales_channel_id })

  product?.variants?.forEach((v: any) => {
    v.inventory_quantity = quantities[v.id]?.availability ?? 0
  })

  res.status(200).json(product)
}
