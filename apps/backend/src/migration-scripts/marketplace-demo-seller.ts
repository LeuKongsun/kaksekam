import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

import { MARKETPLACE_MODULE } from "../modules/marketplace"
import MarketplaceModuleService from "../modules/marketplace/service"
import { listAllProductIds } from "./utils/products"

export default async function marketplace_demo_seller({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService =
    container.resolve(MARKETPLACE_MODULE)

  logger.info("Seeding marketplace demo seller...")

  const [existingSeller] = await marketplaceService.listSellers({
    handle: "demo-seller",
  })

  const seller =
    existingSeller ??
    (await marketplaceService.createSellers({
      display_name: "Demo Seller",
      handle: "demo-seller",
      email: "seller@example.com",
      phone: "+61 400 000 000",
      location: "Melbourne, Australia",
      bio: "A demo seller for local classifieds listings.",
      status: "active",
    }))

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

  logger.info("Finished seeding marketplace demo seller.")
}
