import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { AuthTypes } from "@medusajs/framework/types"

import { MARKETPLACE_MODULE } from "../../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../../modules/marketplace/service"

type ResetSellerPasswordBody = {
  password?: string
}

export async function POST(
  req: MedusaRequest<ResetSellerPasswordBody>,
  res: MedusaResponse,
) {
  const sellerId = req.params.id
  const password = req.body.password
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const [seller] = await marketplaceService.listSellers({ id: sellerId })

  if (!seller) {
    res.status(404).json({ message: "Seller not found." })
    return
  }

  if (!seller.email) {
    res.status(400).json({ message: "Seller does not have an email address." })
    return
  }

  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({ message: "Password must be at least 8 characters." })
    return
  }

  const authService: AuthTypes.IAuthModuleService = req.scope.resolve(
    Modules.AUTH,
  )

  const { success, error } = await authService.updateProvider("emailpass", {
    email: seller.email,
    entity_id: seller.email,
    password,
  })

  if (!success) {
    res.status(400).json({ message: error ?? "Could not reset password." })
    return
  }

  res.sendStatus(201)
}
