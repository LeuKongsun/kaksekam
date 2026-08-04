import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

const CONTACT_CHANNELS = new Set(["telegram", "messenger", "phone"])

type CreateContactEventBody = {
  listing_id?: string
  channel?: "telegram" | "messenger" | "phone"
  referrer?: string
}

type ContactProduct = {
  listing?: {
    id: string
    status: string
  } | null
  seller?: {
    id: string
    status: string
    telegram: string | null
    facebook_url: string | null
    phone: string | null
  } | null
}

const normalizeReferrer = (value?: string) => {
  if (!value) {
    return null
  }

  try {
    const url = new URL(value)
    return `${url.origin}${url.pathname}`.slice(0, 500)
  } catch {
    return null
  }
}

export async function POST(
  req: MedusaRequest<CreateContactEventBody>,
  res: MedusaResponse
) {
  const listingId = req.body.listing_id?.trim()
  const channel = req.body.channel

  if (!listingId || !channel || !CONTACT_CHANNELS.has(channel)) {
    res.status(400).json({ message: "Listing and contact channel are required." })
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const { data } = await query.graph({
    entity: "product",
    fields: [
      "listing.id",
      "listing.status",
      "seller.id",
      "seller.status",
      "seller.telegram",
      "seller.facebook_url",
      "seller.phone",
    ],
    filters: {
      listing: {
        id: listingId,
      },
    } as any,
    pagination: {
      take: 1,
    },
  })
  const product = data[0] as ContactProduct | undefined
  const seller = product?.seller
  const channelIsAvailable =
    channel === "telegram"
      ? Boolean(seller?.telegram)
      : channel === "messenger"
        ? Boolean(seller?.facebook_url)
        : Boolean(seller?.phone)

  if (
    product?.listing?.status !== "active" ||
    seller?.status !== "active" ||
    !channelIsAvailable
  ) {
    res.status(404).json({ message: "Contact option is unavailable." })
    return
  }

  await marketplaceService.createContactEvents({
    listing_id: listingId,
    seller_id: seller.id,
    channel,
    referrer: normalizeReferrer(req.body.referrer),
  })

  res.status(201).json({ recorded: true })
}
