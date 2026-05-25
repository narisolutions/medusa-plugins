import type { Request } from "express"

export function parsePosQueryParams(req: Request) {
  const currency_code =
    typeof req.query.currency_code === "string" && req.query.currency_code
      ? req.query.currency_code
      : undefined

  const custom_fields =
    typeof req.query.custom_fields === "string" && req.query.custom_fields
      ? req.query.custom_fields.split(",").map((f) => f.trim()).filter(Boolean)
      : []

  return { currency_code, custom_fields }
}
