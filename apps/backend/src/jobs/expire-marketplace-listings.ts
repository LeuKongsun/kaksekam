import { MedusaContainer } from "@medusajs/framework/types"

import { MARKETPLACE_MODULE } from "../modules/marketplace"
import MarketplaceModuleService from "../modules/marketplace/service"

export default async function expireMarketplaceListings(
  container: MedusaContainer
) {
  const marketplaceService: MarketplaceModuleService =
    container.resolve(MARKETPLACE_MODULE)
  const activeListings = await marketplaceService.listListings({
    status: "active",
  })
  const now = Date.now()
  const expiredListings = activeListings.filter(
    (listing) =>
      listing.expires_at &&
      new Date(listing.expires_at).getTime() <= now
  )

  await Promise.all(
    expiredListings.map((listing) =>
      marketplaceService.updateListings({
        id: listing.id,
        status: "expired",
      })
    )
  )
}

export const config = {
  name: "expire-marketplace-listings",
  schedule: "0 1 * * *",
}
