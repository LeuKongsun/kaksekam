import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"

type UpdateSellerBody = {
  status?: "active" | "suspended"
  verification_status?: "unverified" | "verified"
}

const ALLOWED_SELLER_STATUSES = new Set(["active", "suspended"])
const ALLOWED_VERIFICATION_STATUSES = new Set(["unverified", "verified"])

export async function POST(
  req: MedusaRequest<UpdateSellerBody>,
  res: MedusaResponse
) {
  const sellerId = req.params.id
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const [seller] = await marketplaceService.listSellers({ id: sellerId })

  if (!seller) {
    res.status(404).json({ message: "Seller not found." })
    return
  }

  const update: UpdateSellerBody = {}

  if (req.body.status) {
    if (!ALLOWED_SELLER_STATUSES.has(req.body.status)) {
      res.status(400).json({ message: "Seller status is invalid." })
      return
    }

    update.status = req.body.status
  }

  if (req.body.verification_status) {
    if (!ALLOWED_VERIFICATION_STATUSES.has(req.body.verification_status)) {
      res.status(400).json({ message: "Verification status is invalid." })
      return
    }

    update.verification_status = req.body.verification_status
  }

  if (!Object.keys(update).length) {
    res.status(400).json({ message: "No seller changes provided." })
    return
  }

  const updatedSeller = await marketplaceService.updateSellers({
    id: seller.id,
    ...update,
  })

  res.json({ seller: updatedSeller })
}
