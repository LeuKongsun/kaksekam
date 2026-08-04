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
  telegram?: string
  facebook_url?: string
  preferred_contact?: "telegram" | "messenger" | "phone"
  location?: string
  bio?: string
  avatar_url?: string
}

const CONTACT_METHODS = new Set(["telegram", "messenger", "phone"])

const cleanTelegram = (value?: string) => {
  const cleaned = value
    ?.trim()
    .replace(/^https?:\/\/(www\.)?(t\.me|telegram\.me)\//i, "")
    .replace(/^@/, "")
    .replace(/\/+$/, "")

  if (!cleaned) {
    return null
  }

  return /^[a-zA-Z0-9_]{5,32}$/.test(cleaned) ? cleaned : undefined
}

const cleanFacebookUrl = (value?: string) => {
  const cleaned = value?.trim()

  if (!cleaned) {
    return null
  }

  try {
    const url = new URL(cleaned)
    return url.protocol === "https:" &&
      ["facebook.com", "www.facebook.com", "m.me"].includes(
        url.hostname.toLowerCase()
      )
      ? url.toString()
      : undefined
  } catch {
    return undefined
  }
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
  const telegram = cleanTelegram(body.telegram)
  const facebookUrl = cleanFacebookUrl(body.facebook_url)
  const preferredContact = body.preferred_contact?.trim()

  if (!displayName || !handle) {
    res.status(400).json({
      message: "Farm or business name and handle are required.",
    })
    return
  }

  if (telegram === undefined) {
    res.status(400).json({ message: "Enter a valid Telegram username." })
    return
  }

  if (facebookUrl === undefined) {
    res.status(400).json({
      message: "Enter a valid Facebook or Messenger HTTPS link.",
    })
    return
  }

  if (
    preferredContact &&
    !CONTACT_METHODS.has(preferredContact)
  ) {
    res.status(400).json({ message: "Choose a valid contact method." })
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
    telegram,
    facebook_url: facebookUrl,
    preferred_contact: (preferredContact || null) as
      | "telegram"
      | "messenger"
      | "phone"
      | null,
    location: cleanOptionalText(body.location),
    bio: cleanOptionalText(body.bio),
    avatar_url: cleanOptionalText(body.avatar_url),
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
