import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"

type UpdateListingStatusBody = {
  status?: string
  moderation_note?: string
}

type AdminAuthenticatedRequest<TBody> = MedusaRequest<TBody> & {
  auth_context?: {
    actor_id?: string
  }
}

const ALLOWED_STATUSES = new Set(["active", "rejected"])
const PAGE_SIZE = 100

type ListingProduct = {
  id: string
  seller?: {
    phone: string | null
    telegram: string | null
    facebook_url: string | null
  } | null
  listing?: {
    id: string
  } | null
}

async function findProductForListing(query: any, listingId: string) {
  let skip = 0
  let totalCount: number | undefined
  let hasMoreProducts = true

  while (hasMoreProducts) {
    const { data, metadata } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "listing.id",
        "seller.phone",
        "seller.telegram",
        "seller.facebook_url",
      ],
      pagination: {
        skip,
        take: PAGE_SIZE,
      },
    })
    const product = (data as ListingProduct[]).find(
      (candidate) => candidate.listing?.id === listingId
    )

    if (product) {
      return product
    }

    totalCount = metadata?.count
    skip += data.length
    hasMoreProducts =
      data.length > 0 &&
      (totalCount === undefined ? data.length === PAGE_SIZE : skip < totalCount)
  }

  return null
}

export async function POST(
  req: AdminAuthenticatedRequest<UpdateListingStatusBody>,
  res: MedusaResponse
) {
  const listingId = req.params.id
  const status = req.body.status

  if (!status || !ALLOWED_STATUSES.has(status)) {
    res.status(400).json({
      message: "Status must be active or rejected.",
    })
    return
  }
  const nextStatus = status as "active" | "rejected"

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const product = await findProductForListing(query, listingId)

  if (!product) {
    res.status(404).json({ message: "Listing product not found." })
    return
  }

  if (
    nextStatus === "active" &&
    !product.seller?.phone &&
    !product.seller?.telegram &&
    !product.seller?.facebook_url
  ) {
    res.status(409).json({
      message:
        "Add a seller phone, Telegram username, or Messenger link before approval.",
    })
    return
  }

  const listing = await marketplaceService.updateListings({
    id: listingId,
    status: nextStatus,
    moderation_note:
      nextStatus === "rejected" ? req.body.moderation_note?.trim() || null : null,
    reviewed_at: new Date(),
    reviewer_id: req.auth_context?.actor_id ?? null,
    expires_at:
      nextStatus === "active"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : undefined,
    refreshed_at: nextStatus === "active" ? new Date() : undefined,
  })

  await updateProductsWorkflow(req.scope).run({
    input: {
      products: [
        {
          id: product.id,
          status:
            nextStatus === "active" ? ProductStatus.PUBLISHED : ProductStatus.DRAFT,
        },
      ],
    },
  })

  res.json({ listing })
}
