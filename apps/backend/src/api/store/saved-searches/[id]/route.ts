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
  const savedSearchId = req.params.id
  const customerId = req.auth_context.actor_id
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const [savedSearch] = await marketplaceService.listSavedSearches({
    id: savedSearchId,
    customer_id: customerId,
  })

  if (!savedSearch) {
    res.status(404).json({ message: "Saved search not found." })
    return
  }

  await marketplaceService.deleteSavedSearches(savedSearch.id)

  res.status(204).send()
}
