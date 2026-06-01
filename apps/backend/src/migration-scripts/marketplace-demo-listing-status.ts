import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

import { MARKETPLACE_MODULE } from "../modules/marketplace"
import MarketplaceModuleService from "../modules/marketplace/service"

const PRODUCT_PAGE_SIZE = 100

type ProductWithListing = {
  id: string
  listing?: {
    id: string
    status: string
  } | null
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
      fields: ["id", "listing.id", "listing.status"],
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
      (totalCount === undefined
        ? products.length > 0 && products.length % PRODUCT_PAGE_SIZE === 0
        : products.length < totalCount)
  }

  return products
}

export default async function marketplace_demo_listing_status({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService =
    container.resolve(MARKETPLACE_MODULE)

  logger.info("Seeding marketplace demo listing statuses...")

  const products = await listAllProductsWithListings(query.graph)

  for (const product of products) {
    if (product.listing?.id) {
      if (product.listing.status !== "active") {
        await marketplaceService.updateListings({
          id: product.listing.id,
          status: "active",
        })
      }

      continue
    }

    const listing = await marketplaceService.createListings({
      status: "active",
    })

    try {
      await link.create({
        [Modules.PRODUCT]: {
          product_id: product.id,
        },
        [MARKETPLACE_MODULE]: {
          listing_id: listing.id,
        },
      })
    } catch (error) {
      logger.debug(
        `Skipping marketplace listing link for product ${product.id}: ${
          error instanceof Error ? error.message : "already linked"
        }`
      )
    }
  }

  logger.info("Finished seeding marketplace demo listing statuses.")
}
