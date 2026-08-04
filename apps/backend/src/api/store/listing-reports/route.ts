import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

const REPORT_REASONS = new Set([
  "unavailable",
  "misleading",
  "fraud",
  "prohibited",
  "other",
])

type CreateListingReportBody = {
  listing_id?: string
  reason?: "unavailable" | "misleading" | "fraud" | "prohibited" | "other"
  details?: string
  reporter_contact?: string
}

export async function POST(
  req: MedusaRequest<CreateListingReportBody>,
  res: MedusaResponse
) {
  const listingId = req.body.listing_id?.trim()
  const reason = req.body.reason

  if (!listingId || !reason || !REPORT_REASONS.has(reason)) {
    res.status(400).json({ message: "Listing and report reason are required." })
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: ["listing.id", "listing.status", "seller.id", "seller.status"],
    filters: {
      listing: {
        id: listingId,
      },
    } as any,
    pagination: {
      take: 1,
    },
  })
  const product = data[0] as
    | {
        listing?: { id: string; status: string } | null
        seller?: { id: string; status: string } | null
      }
    | undefined

  if (
    product?.listing?.status !== "active" ||
    product.seller?.status !== "active"
  ) {
    res.status(404).json({ message: "Listing not found." })
    return
  }

  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  await marketplaceService.createListingReports({
    listing_id: listingId,
    seller_id: product.seller.id,
    reason,
    details: req.body.details?.trim().slice(0, 1000) || null,
    reporter_contact:
      req.body.reporter_contact?.trim().slice(0, 200) || null,
    status: "new",
  })

  res.status(201).json({ submitted: true })
}
