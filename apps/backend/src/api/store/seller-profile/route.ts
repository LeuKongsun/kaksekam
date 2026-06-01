import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"
import { cleanOptionalText, slugifySellerHandle } from "./utils"

type UpdateSellerProfileBody = {
  display_name?: string
  handle?: string
  email?: string
  phone?: string
  location?: string
  bio?: string
}

async function getSellerForCustomer(
  marketplaceService: MarketplaceModuleService,
  customerId: string
) {
  const [seller] = await marketplaceService.listSellers({
    customer_id: customerId,
  })

  return seller ?? null
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const seller = await getSellerForCustomer(
    marketplaceService,
    req.auth_context.actor_id
  )

  res.json({ seller })
}

export async function PATCH(
  req: AuthenticatedMedusaRequest<UpdateSellerProfileBody>,
  res: MedusaResponse
) {
  const body = req.body
  const customerId = req.auth_context.actor_id
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const displayName = body.display_name?.trim()
  const handle = slugifySellerHandle(body.handle || displayName || "")

  if (!displayName || !handle) {
    res.status(400).json({
      message: "Farm or business name and handle are required.",
    })
    return
  }

  const existingSeller = await getSellerForCustomer(
    marketplaceService,
    customerId
  )
  const [sellerWithHandle] = await marketplaceService.listSellers({ handle })

  if (sellerWithHandle && sellerWithHandle.id !== existingSeller?.id) {
    res.status(409).json({ message: "That seller handle is already in use." })
    return
  }

  const sellerInput = {
    display_name: displayName,
    handle,
    customer_id: customerId,
    email: cleanOptionalText(body.email),
    phone: cleanOptionalText(body.phone),
    location: cleanOptionalText(body.location),
    bio: cleanOptionalText(body.bio),
    status: "active" as const,
  }
  const seller = existingSeller
    ? await marketplaceService.updateSellers({
        id: existingSeller.id,
        ...sellerInput,
      })
    : await marketplaceService.createSellers(sellerInput)

  res.json({ seller })
}
