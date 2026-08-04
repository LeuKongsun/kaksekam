import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { MARKETPLACE_MODULE } from "../../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../../modules/marketplace/service"
import { getSellerTrustStats } from "../../../sellers/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const productId = req.params.id

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "seller.id",
      "seller.display_name",
      "seller.handle",
      "seller.email",
      "seller.phone",
      "seller.telegram",
      "seller.facebook_url",
      "seller.preferred_contact",
      "seller.location",
      "seller.bio",
      "seller.avatar_url",
      "seller.status",
      "seller.verification_status",
      "seller.created_at",
      "listing.id",
      "listing.status",
    ],
    filters: {
      id: productId,
    },
  })

  const seller = products[0]?.seller
  const listing = products[0]?.listing
  const activeSeller =
    seller?.status === "active" && listing?.status === "active" ? seller : null

  if (!activeSeller) {
    res.json({ seller: null })
    return
  }

  const inquiries = await marketplaceService.listListingInquiries({
    seller_id: activeSeller.id,
  })
  
  const { data: sellersData } = await query.graph({
    entity: "seller",
    fields: ["id", "products.listing.status"],
    filters: {
      id: activeSeller.id,
    },
  })

  const sellerProducts = sellersData[0]?.products || []
  const activeListingCount = sellerProducts.filter(
    (p: any) => p.listing?.status === "active"
  ).length

  res.json({
    seller: {
      ...activeSeller,
      active_listing_count: activeListingCount,
      trust_stats: getSellerTrustStats(activeSeller, inquiries),
    },
  })
}
