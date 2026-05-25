import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  getVariantAvailability,
  QueryContext,
} from "@medusajs/utils"
import { resolveSalesChannelProductFields } from "../../../../utils/product-fields"
import { parsePosQueryParams } from "../../../../utils/query-params"
import { getPluginOptions } from "../../../../index"

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const { sales_channel_id } = req.params
  const { currency_code: qsCurrency, custom_fields } = parsePosQueryParams(req)
  const currency_code = qsCurrency ?? getPluginOptions().defaultCurrencyCode
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const fields = resolveSalesChannelProductFields(custom_fields)

  const context = currency_code
    ? {
        products_link: {
          product: {
            variants: {
              calculated_price: QueryContext({ currency_code }),
            },
          },
        },
      }
    : {}

  const { data: [sales_channel] } = await query.graph(
    {
      entity: "sales_channel",
      filters: { id: sales_channel_id },
      fields,
      context,
    },
    { cache: { enable: true, autoInvalidate: true } }
  )

  const products =
    sales_channel?.products_link
      ?.map((i: any) => i?.product)
      .filter((i: any) => i?.status === "published") ?? []

  const variant_ids = products
    .map((p: any) => (p?.variants ?? []).map((v: any) => v.id))
    .flat()

  const quantities = await getVariantAvailability(query, { variant_ids, sales_channel_id })

  products.forEach((p: any) => {
    p?.variants?.forEach((v: any) => {
      v.inventory_quantity = quantities[v.id]?.availability ?? 0
    })
  })

  res.status(200).json(products)
}
