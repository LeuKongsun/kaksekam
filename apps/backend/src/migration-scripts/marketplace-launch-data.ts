import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

import { MARKETPLACE_MODULE } from "../modules/marketplace"
import MarketplaceModuleService from "../modules/marketplace/service"

type LaunchSeller = {
  display_name: string
  handle: string
  phone?: string
  telegram?: string
  facebook_url?: string
  preferred_contact?: "telegram" | "messenger" | "phone"
  location: string
  bio?: string
}

type LaunchListing = {
  seller_handle: string
  title: string
  handle: string
  description: string
  image_urls: string[]
  price: number
  currency_code?: "khr" | "usd"
  category: string
  province: string
  district?: string
  quantity?: string
  unit?: string
  minimum_order?: string
  condition?: string
  availability?: string
  production_method?: string
  negotiable?: boolean
  contact_preference?: "telegram" | "messenger" | "phone"
}

type LaunchData = {
  sellers: LaunchSeller[]
  listings: LaunchListing[]
}

const requireText = (value: string | undefined, label: string) => {
  if (!value?.trim()) {
    throw new Error(`${label} is required.`)
  }
  return value.trim()
}

const validateData = (data: LaunchData) => {
  if (!Array.isArray(data.sellers) || !Array.isArray(data.listings)) {
    throw new Error("Launch data must contain sellers and listings arrays.")
  }

  const sellerHandles = new Set<string>()
  data.sellers.forEach((seller, index) => {
    requireText(seller.display_name, `sellers[${index}].display_name`)
    const handle = requireText(seller.handle, `sellers[${index}].handle`)
    requireText(seller.location, `sellers[${index}].location`)
    if (!seller.phone && !seller.telegram && !seller.facebook_url) {
      throw new Error(`Seller ${handle} needs phone, Telegram, or Messenger.`)
    }
    if (sellerHandles.has(handle)) {
      throw new Error(`Duplicate seller handle: ${handle}`)
    }
    sellerHandles.add(handle)
  })

  data.listings.forEach((listing, index) => {
    requireText(listing.title, `listings[${index}].title`)
    requireText(listing.handle, `listings[${index}].handle`)
    requireText(listing.category, `listings[${index}].category`)
    requireText(listing.province, `listings[${index}].province`)
    if (!sellerHandles.has(listing.seller_handle)) {
      throw new Error(`Unknown seller: ${listing.seller_handle}`)
    }
    if (!Number.isFinite(listing.price) || listing.price <= 0) {
      throw new Error(`Listing ${listing.handle} needs a positive price.`)
    }
    if (!listing.image_urls?.length) {
      throw new Error(`Listing ${listing.handle} needs at least one photo.`)
    }
  })
}

export default async function marketplaceLaunchData({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const marketplaceService: MarketplaceModuleService =
    container.resolve(MARKETPLACE_MODULE)
  const inputPath = process.env.MARKETPLACE_LAUNCH_DATA_PATH

  if (!inputPath) {
    throw new Error(
      "Set MARKETPLACE_LAUNCH_DATA_PATH to a reviewed launch-data JSON file."
    )
  }

  const data = JSON.parse(
    await readFile(resolve(process.cwd(), inputPath), "utf8")
  ) as LaunchData
  validateData(data)

  const [{ data: shippingProfiles }, { data: salesChannels }] =
    await Promise.all([
      query.graph({
        entity: "shipping_profile",
        fields: ["id"],
        pagination: { take: 1 },
      }),
      query.graph({
        entity: "sales_channel",
        fields: ["id"],
        pagination: { take: 1 },
      }),
    ])
  const shippingProfileId = shippingProfiles[0]?.id
  const salesChannelId = salesChannels[0]?.id

  if (!shippingProfileId) {
    throw new Error("No shipping profile is configured.")
  }

  const sellersByHandle = new Map<string, { id: string }>()
  for (const input of data.sellers) {
    const [existing] = await marketplaceService.listSellers({
      handle: input.handle,
    })
    const seller = existing
      ? await marketplaceService.updateSellers({
          id: existing.id,
          ...input,
          status: "active",
        })
      : await marketplaceService.createSellers({
          ...input,
          email: null,
          customer_id: null,
          avatar_url: null,
          status: "active",
          verification_status: "unverified",
        })
    sellersByHandle.set(input.handle, seller)
  }

  for (const input of data.listings) {
    const { data: existingProducts } = await query.graph({
      entity: "product",
      fields: ["id", "listing.id"],
      filters: { handle: input.handle },
      pagination: { take: 1 },
    })

    if (existingProducts[0]) {
      logger.info(`Skipping existing launch listing: ${input.handle}`)
      continue
    }

    const images = input.image_urls.map((url) => ({ url }))
    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: input.title,
            handle: input.handle,
            description: input.description,
            thumbnail: images[0].url,
            images,
            status: ProductStatus.DRAFT,
            shipping_profile_id: shippingProfileId,
            sales_channels: salesChannelId ? [{ id: salesChannelId }] : [],
            options: [{ title: "Listing", values: ["Default"] }],
            variants: [
              {
                title: "Default",
                options: { Listing: "Default" },
                manage_inventory: false,
                prices: [
                  {
                    amount: input.price,
                    currency_code: input.currency_code ?? "khr",
                  },
                ],
              },
            ],
          },
        ],
      },
    })
    const seller = sellersByHandle.get(input.seller_handle)
    if (!seller) throw new Error(`Missing seller ${input.seller_handle}`)

    const listing = await marketplaceService.createListings({
      status: "pending_review",
      category: input.category,
      location: input.province,
      district: input.district ?? null,
      quantity: input.quantity ?? null,
      unit: input.unit ?? null,
      minimum_order: input.minimum_order ?? null,
      condition: input.condition ?? null,
      availability: input.availability ?? null,
      production_method: input.production_method ?? null,
      negotiable: input.negotiable ?? false,
      contact_preference: input.contact_preference ?? null,
      refreshed_at: new Date(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })

    await link.create({
      [Modules.PRODUCT]: { product_id: result[0].id },
      [MARKETPLACE_MODULE]: { seller_id: seller.id },
    })
    await link.create({
      [Modules.PRODUCT]: { product_id: result[0].id },
      [MARKETPLACE_MODULE]: { listing_id: listing.id },
    })
  }

  logger.info(
    `Imported ${data.sellers.length} launch sellers and reviewed ${data.listings.length} listings.`
  )
}
