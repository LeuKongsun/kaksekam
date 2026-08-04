import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const [seller] = await marketplaceService.listSellers({
    customer_id: req.auth_context.actor_id,
  })

  if (!seller) {
    res.json({
      metrics: {
        total: 0,
        telegram: 0,
        messenger: 0,
        phone: 0,
        last_14_days: 0,
      },
    })
    return
  }

  const events = await marketplaceService.listContactEvents({
    seller_id: seller.id,
  })
  const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000

  res.json({
    metrics: {
      total: events.length,
      telegram: events.filter((event) => event.channel === "telegram").length,
      messenger: events.filter((event) => event.channel === "messenger").length,
      phone: events.filter((event) => event.channel === "phone").length,
      last_14_days: events.filter(
        (event) => new Date(event.created_at).getTime() >= fourteenDaysAgo
      ).length,
    },
  })
}
