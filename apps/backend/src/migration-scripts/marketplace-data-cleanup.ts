import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  deleteProductsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"

import { MARKETPLACE_MODULE } from "../modules/marketplace"
import MarketplaceModuleService from "../modules/marketplace/service"

const PRODUCT_PAGE_SIZE = 100
const LEGACY_PRODUCT_HANDLES = new Set([
  "t-shirt",
  "sweatshirt",
  "sweatpants",
  "shorts",
])

type ProductWithListing = {
  id: string
  handle: string
  title: string
  listing?: {
    id: string
    status: string
    category: string | null
    location: string | null
    quantity: string | null
    unit: string | null
    condition: string | null
  } | null
}

const cleanText = (value?: string | null) => {
  const cleaned = value?.trim()

  return cleaned || null
}

async function listAllProductsWithListings(
  graph: (queryConfig: {
    entity: "product"
    fields: string[]
    pagination: {
      skip: number
      take: number
    }
  }) => Promise<{
    data: ProductWithListing[]
    metadata?: {
      count: number
    }
  }>
): Promise<ProductWithListing[]> {
  const products: ProductWithListing[] = []
  let skip = 0
  let totalCount: number | undefined
  let hasMoreProducts = true

  while (hasMoreProducts) {
    const { data, metadata } = await graph({
      entity: "product",
      fields: [
        "id",
        "handle",
        "title",
        "listing.id",
        "listing.status",
        "listing.category",
        "listing.location",
        "listing.quantity",
        "listing.unit",
        "listing.condition",
      ],
      pagination: {
        skip,
        take: PRODUCT_PAGE_SIZE,
      },
    })

    products.push(...data)
    totalCount = metadata?.count
    skip += data.length
    hasMoreProducts =
      data.length > 0 &&
      (totalCount === undefined ? data.length === PRODUCT_PAGE_SIZE : skip < totalCount)
  }

  return products
}

async function removeLegacyProduct(
  container: MedusaContainer,
  product: ProductWithListing
) {
  try {
    await deleteProductsWorkflow(container).run({
      input: {
        ids: [product.id],
      },
    })

    return "deleted"
  } catch {
    await updateProductsWorkflow(container).run({
      input: {
        products: [
          {
            id: product.id,
            status: ProductStatus.DRAFT,
          },
        ],
      },
    })

    return "drafted"
  }
}

export default async function marketplace_data_cleanup({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService =
    container.resolve(MARKETPLACE_MODULE)

  logger.info("Cleaning marketplace demo data...")

  const products = await listAllProductsWithListings(query.graph)
  let removedLegacyProducts = 0
  let draftedLegacyProducts = 0
  let normalizedListings = 0
  let expiredUnstructuredListings = 0

  for (const product of products) {
    if (LEGACY_PRODUCT_HANDLES.has(product.handle)) {
      const result = await removeLegacyProduct(container, product)

      if (result === "deleted") {
        removedLegacyProducts += 1
      } else {
        draftedLegacyProducts += 1
      }

      continue
    }

    if (!product.listing?.id) {
      continue
    }

    const nextListing = {
      id: product.listing.id,
      category: cleanText(product.listing.category),
      location: cleanText(product.listing.location),
      quantity: cleanText(product.listing.quantity),
      unit: cleanText(product.listing.unit),
      condition: cleanText(product.listing.condition),
    }

    if (!nextListing.category && product.listing.status !== "expired") {
      await marketplaceService.updateListings({
        ...nextListing,
        status: "expired",
      })
      expiredUnstructuredListings += 1
      continue
    }

    const hasChanged =
      nextListing.category !== product.listing.category ||
      nextListing.location !== product.listing.location ||
      nextListing.quantity !== product.listing.quantity ||
      nextListing.unit !== product.listing.unit ||
      nextListing.condition !== product.listing.condition

    if (hasChanged) {
      await marketplaceService.updateListings(nextListing)
      normalizedListings += 1
    }
  }

  logger.info(
    `Finished marketplace cleanup. Removed ${removedLegacyProducts} legacy products, drafted ${draftedLegacyProducts}, expired ${expiredUnstructuredListings} unstructured listings, normalized ${normalizedListings} listings.`
  )
}
