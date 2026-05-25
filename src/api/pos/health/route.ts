import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"

export const GET = (_req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  res.status(200).json({ status: "ok" })
}
