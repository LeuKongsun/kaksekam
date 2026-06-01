import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const savedListingId = req.params.id
  const customerId = req.auth_context.actor_id
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const [savedListing] = await marketplaceService.listSavedListings({
    id: savedListingId,
    customer_id: customerId,
  })

  if (!savedListing) {
    res.status(404).json({ message: "Saved listing not found." })
    return
  }

  await marketplaceService.deleteSavedListings(savedListing.id)

  res.status(200).json({
    id: savedListing.id,
    object: "saved_listing",
    deleted: true,
  })
}
