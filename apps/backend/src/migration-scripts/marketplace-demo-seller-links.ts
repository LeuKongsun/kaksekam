import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

import { MARKETPLACE_MODULE } from "../modules/marketplace"
import MarketplaceModuleService from "../modules/marketplace/service"
import { listAllProductIds } from "./utils/products"

export default async function marketplace_demo_seller_links({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService =
    container.resolve(MARKETPLACE_MODULE)

  logger.info("Linking demo seller to marketplace listings...")

  const [seller] = await marketplaceService.listSellers({
    handle: "demo-seller",
  })

  if (!seller) {
    logger.warn("Demo seller not found. Skipping listing ownership links.")
    return
  }

  const products = await listAllProductIds(query.graph)

  for (const product of products) {
    try {
      await link.create({
        [Modules.PRODUCT]: {
          product_id: product.id,
        },
        [MARKETPLACE_MODULE]: {
          seller_id: seller.id,
        },
      })
    } catch (error) {
      logger.debug(
        `Skipping marketplace seller link for product ${product.id}: ${
          error instanceof Error ? error.message : "already linked"
        }`
      )
    }
  }

  logger.info("Finished linking demo seller to marketplace listings.")
}
