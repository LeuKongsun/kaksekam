import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { MARKETPLACE_MODULE } from "../../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../../modules/marketplace/service"

type UpdateSellerVerificationBody = {
  verification_status?: "unverified" | "verified"
}

const ALLOWED_STATUSES = new Set(["unverified", "verified"])

export async function POST(
  req: MedusaRequest<UpdateSellerVerificationBody>,
  res: MedusaResponse
) {
  const sellerId = req.params.id
  const verificationStatus = req.body.verification_status

  if (!verificationStatus || !ALLOWED_STATUSES.has(verificationStatus)) {
    res.status(400).json({
      message: "Verification status must be unverified or verified.",
    })
    return
  }

  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const [seller] = await marketplaceService.listSellers({ id: sellerId })

  if (!seller) {
    res.status(404).json({ message: "Seller not found." })
    return
  }

  const updatedSeller = await marketplaceService.updateSellers({
    id: seller.id,
    verification_status: verificationStatus,
  })

  res.json({ seller: updatedSeller })
}
