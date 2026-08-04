import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const reports = await marketplaceService.listListingReports({})
  const listingIds = Array.from(
    new Set(reports.map((report) => report.listing_id))
  )
  const { data: products } = listingIds.length
    ? await query.graph({
        entity: "product",
        fields: [
          "title",
          "handle",
          "listing.id",
          "listing.status",
          "seller.display_name",
        ],
        filters: {
          listing: {
            id: listingIds,
          },
        } as any,
      })
    : { data: [] }
  const listingDetails = new Map(
    products.map((product: any) => [
      product.listing?.id,
      {
        title: product.title,
        handle: product.handle,
        listing_status: product.listing?.status,
        seller_name: product.seller?.display_name,
      },
    ])
  )

  res.json({
    reports: reports
      .map((report) => ({
        ...report,
        listing: listingDetails.get(report.listing_id) ?? null,
      }))
      .sort(
        (left, right) =>
          new Date(right.created_at).getTime() -
          new Date(left.created_at).getTime()
      ),
  })
}
