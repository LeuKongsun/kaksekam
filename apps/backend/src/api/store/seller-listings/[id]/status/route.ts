import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

import { MARKETPLACE_MODULE } from "../../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../../modules/marketplace/service"

type UpdateSellerListingStatusBody = {
  status?: "sold"
}

type OwnedListingProduct = {
  id: string
  seller?: {
    customer_id: string | null
  } | null
  listing?: {
    id: string
    status: string
  } | null
}

const PAGE_SIZE = 100

async function findOwnedListingProduct(
  query: any,
  listingId: string,
  customerId: string
): Promise<OwnedListingProduct | null> {
  let skip = 0
  let totalCount: number | undefined
  let hasMoreProducts = true

  while (hasMoreProducts) {
    const { data, metadata } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "seller.customer_id",
        "listing.id",
        "listing.status",
      ],
      pagination: {
        skip,
        take: PAGE_SIZE,
      },
    })

    const product = (data as OwnedListingProduct[]).find(
      (candidate) =>
        candidate.listing?.id === listingId &&
        candidate.seller?.customer_id === customerId
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

export async function PATCH(
  req: AuthenticatedMedusaRequest<UpdateSellerListingStatusBody>,
  res: MedusaResponse
) {
  const listingId = req.params.id
  const customerId = req.auth_context.actor_id
  const nextStatus = req.body.status

  if (nextStatus !== "sold") {
    res.status(400).json({ message: "Valid listing status is required." })
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const product = await findOwnedListingProduct(query, listingId, customerId)

  if (!product?.listing) {
    res.status(404).json({ message: "Listing not found." })
    return
  }

  if (product.listing.status !== "active") {
    res.status(409).json({ message: "Only active listings can be marked sold." })
    return
  }

  await updateProductsWorkflow(req.scope).run({
    input: {
      products: [
        {
          id: product.id,
          status: ProductStatus.DRAFT,
        },
      ],
    },
  })

  const listing = await marketplaceService.updateListings({
    id: product.listing.id,
    status: nextStatus,
    moderation_note: null,
  })

  res.json({ listing })
}
