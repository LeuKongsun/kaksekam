import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

type CreateSellerListingBody = {
  title?: string
  description?: string
  image_urls?: string[] | string
  price?: number | string
  currency_code?: string
  category?: string
  location?: string
  quantity?: string
  unit?: string
  availability?: string
  condition?: string
  contact_preference?: string
  variety?: string
  production_method?: string
  harvest_date?: string
  breed?: string
  age?: string
  sex?: string
  health_notes?: string
  brand?: string
  equipment_model?: string
  year?: string
  pack_size?: string
  expiry_date?: string
  service_area?: string
}

type ProductWithMarketplace = {
  id: string
  title: string
  handle: string
  description: string | null
  thumbnail: string | null
  images?: {
    url?: string | null
  }[]
  seller?: {
    id: string
    customer_id: string | null
    display_name: string
    handle: string
    email: string | null
    phone: string | null
    location: string | null
    bio: string | null
    avatar_url: string | null
    verification_status: string
  } | null
  listing?: {
    id: string
    status: string
    moderation_note: string | null
    reviewed_at: string | null
    reviewer_id: string | null
    category: string | null
    location: string | null
    quantity: string | null
    unit: string | null
    availability: string | null
    condition: string | null
    contact_preference: string | null
    variety: string | null
    production_method: string | null
    harvest_date: string | null
    breed: string | null
    age: string | null
    sex: string | null
    health_notes: string | null
    brand: string | null
    equipment_model: string | null
    year: string | null
    pack_size: string | null
    expiry_date: string | null
    service_area: string | null
    created_at: string
    updated_at: string
  } | null
  variants?: {
    id: string
    prices?: {
      amount?: number
      currency_code?: string
    }[]
  }[]
}

const LISTING_PAGE_SIZE = 100

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const cleanOptionalText = (value?: string) => {
  const cleaned = value?.trim()

  return cleaned || null
}

const parseImageUrls = (value?: string[] | string) => {
  const values = Array.isArray(value) ? value : value?.split(/\r?\n|,/) ?? []

  return values
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => ({ url }))
}

const getListingPrice = (product: ProductWithMarketplace) => {
  const price = product.variants?.[0]?.prices?.[0]

  return price
    ? {
        calculated_amount: price.amount,
        currency_code: price.currency_code,
      }
    : null
}

async function getDefaultShippingProfileId(query: any) {
  const { data } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
    pagination: {
      skip: 0,
      take: 1,
    },
  })

  return data[0]?.id
}

async function getDefaultSalesChannelId(query: any) {
  const { data } = await query.graph({
    entity: "sales_channel",
    fields: ["id"],
    pagination: {
      skip: 0,
      take: 1,
    },
  })

  return data[0]?.id
}

async function listProductsForCustomer(
  query: any,
  customerId: string
): Promise<ProductWithMarketplace[]> {
  const products: ProductWithMarketplace[] = []
  let skip = 0
  let totalCount: number | undefined
  let hasMoreProducts = true

  while (hasMoreProducts) {
    const { data, metadata } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "description",
        "thumbnail",
        "images.url",
        "seller.id",
        "seller.customer_id",
        "seller.display_name",
        "seller.handle",
        "seller.email",
        "seller.phone",
        "seller.location",
        "seller.bio",
        "seller.avatar_url",
        "seller.verification_status",
        "listing.id",
        "listing.status",
        "listing.moderation_note",
        "listing.reviewed_at",
        "listing.reviewer_id",
        "listing.category",
        "listing.location",
        "listing.quantity",
        "listing.unit",
        "listing.availability",
        "listing.condition",
        "listing.contact_preference",
        "listing.variety",
        "listing.production_method",
        "listing.harvest_date",
        "listing.breed",
        "listing.age",
        "listing.sex",
        "listing.health_notes",
        "listing.brand",
        "listing.equipment_model",
        "listing.year",
        "listing.pack_size",
        "listing.expiry_date",
        "listing.service_area",
        "listing.created_at",
        "listing.updated_at",
        "variants.id",
        "variants.prices.amount",
        "variants.prices.currency_code",
      ],
      pagination: {
        skip,
        take: LISTING_PAGE_SIZE,
      },
    })

    products.push(
      ...data.filter(
        (product: ProductWithMarketplace) =>
          product.seller?.customer_id === customerId && product.listing
      )
    )

    totalCount = metadata?.count
    skip += data.length
    hasMoreProducts =
      data.length > 0 &&
      (totalCount === undefined
        ? data.length === LISTING_PAGE_SIZE
        : skip < totalCount)
  }

  return products
}

async function ensureSeller({
  customerId,
  marketplaceService,
}: {
  customerId: string
  marketplaceService: MarketplaceModuleService
}) {
  const [existingSeller] = await marketplaceService.listSellers({
    customer_id: customerId,
  })

  if (existingSeller) {
    return existingSeller
  }

  const displayName = "Marketplace Seller"
  const handle = `${slugify(displayName) || "seller"}-${customerId.slice(-8)}`

  return marketplaceService.createSellers({
    display_name: displayName,
    handle,
    customer_id: customerId,
    email: null,
    phone: null,
    location: null,
    bio: null,
    status: "active",
  })
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const customerId = req.auth_context.actor_id

  const products = await listProductsForCustomer(query, customerId)

  res.json({
    listings: products.map((product) => ({
      id: product.listing!.id,
      product_id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      thumbnail: product.thumbnail,
      image_urls: product.images?.map((image) => image.url).filter(Boolean) ?? [],
      status: product.listing!.status,
      moderation_note: product.listing!.moderation_note,
      reviewed_at: product.listing!.reviewed_at,
      reviewer_id: product.listing!.reviewer_id,
      category: product.listing!.category,
      location: product.listing!.location,
      quantity: product.listing!.quantity,
      unit: product.listing!.unit,
      availability: product.listing!.availability,
      condition: product.listing!.condition,
      contact_preference: product.listing!.contact_preference,
      variety: product.listing!.variety,
      production_method: product.listing!.production_method,
      harvest_date: product.listing!.harvest_date,
      breed: product.listing!.breed,
      age: product.listing!.age,
      sex: product.listing!.sex,
      health_notes: product.listing!.health_notes,
      brand: product.listing!.brand,
      equipment_model: product.listing!.equipment_model,
      year: product.listing!.year,
      pack_size: product.listing!.pack_size,
      expiry_date: product.listing!.expiry_date,
      service_area: product.listing!.service_area,
      created_at: product.listing!.created_at,
      updated_at: product.listing!.updated_at,
      seller: product.seller ?? null,
      price: getListingPrice(product),
    })),
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<CreateSellerListingBody>,
  res: MedusaResponse
) {
  const body = req.body
  const title = body.title?.trim()
  const description = body.description?.trim()
  const images = parseImageUrls(body.image_urls)
  const price = Math.max(0, Number(body.price ?? 0))
  const currencyCode = (body.currency_code || "eur").toLowerCase()

  if (!title || !description || !Number.isFinite(price) || price <= 0) {
    res.status(400).json({
      message: "Title, description, and a positive price are required.",
    })
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const link = req.scope.resolve(ContainerRegistrationKeys.LINK)
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const customerId = req.auth_context.actor_id

  const [seller, shippingProfileId, salesChannelId] = await Promise.all([
    ensureSeller({ customerId, marketplaceService }),
    getDefaultShippingProfileId(query),
    getDefaultSalesChannelId(query),
  ])

  if (!shippingProfileId) {
    res.status(500).json({ message: "No shipping profile is configured." })
    return
  }

  const handle = `${slugify(title) || "listing"}-${Date.now()}`
  const { result } = await createProductsWorkflow(req.scope).run({
    input: {
      products: [
        {
          title,
          handle,
          description,
          thumbnail: images[0]?.url,
          images,
          status: ProductStatus.DRAFT,
          shipping_profile_id: shippingProfileId,
          sales_channels: salesChannelId ? [{ id: salesChannelId }] : [],
          options: [
            {
              title: "Listing",
              values: ["Default"],
            },
          ],
          variants: [
            {
              title: "Default",
              options: {
                Listing: "Default",
              },
              manage_inventory: false,
              prices: [
                {
                  amount: price,
                  currency_code: currencyCode,
                },
              ],
            },
          ],
        },
      ],
    },
  })
  const product = result[0]
  const listing = await marketplaceService.createListings({
    status: "pending_review",
    category: cleanOptionalText(body.category),
    location: cleanOptionalText(body.location),
    quantity: cleanOptionalText(body.quantity),
    unit: cleanOptionalText(body.unit),
    availability: cleanOptionalText(body.availability),
    condition: cleanOptionalText(body.condition),
    contact_preference: cleanOptionalText(body.contact_preference),
    variety: cleanOptionalText(body.variety),
    production_method: cleanOptionalText(body.production_method),
    harvest_date: cleanOptionalText(body.harvest_date),
    breed: cleanOptionalText(body.breed),
    age: cleanOptionalText(body.age),
    sex: cleanOptionalText(body.sex),
    health_notes: cleanOptionalText(body.health_notes),
    brand: cleanOptionalText(body.brand),
    equipment_model: cleanOptionalText(body.equipment_model),
    year: cleanOptionalText(body.year),
    pack_size: cleanOptionalText(body.pack_size),
    expiry_date: cleanOptionalText(body.expiry_date),
    service_area: cleanOptionalText(body.service_area),
  })

  await link.create({
    [Modules.PRODUCT]: {
      product_id: product.id,
    },
    [MARKETPLACE_MODULE]: {
      seller_id: seller.id,
    },
  })

  await link.create({
    [Modules.PRODUCT]: {
      product_id: product.id,
    },
    [MARKETPLACE_MODULE]: {
      listing_id: listing.id,
    },
  })

  res.status(201).json({
    listing: {
      id: listing.id,
      product_id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      thumbnail: product.thumbnail,
      image_urls: images.map((image) => image.url),
      status: listing.status,
      moderation_note: listing.moderation_note,
      reviewed_at: listing.reviewed_at,
      reviewer_id: listing.reviewer_id,
      category: listing.category,
      location: listing.location,
      quantity: listing.quantity,
      unit: listing.unit,
      availability: listing.availability,
      condition: listing.condition,
      contact_preference: listing.contact_preference,
      variety: listing.variety,
      production_method: listing.production_method,
      harvest_date: listing.harvest_date,
      breed: listing.breed,
      age: listing.age,
      sex: listing.sex,
      health_notes: listing.health_notes,
      brand: listing.brand,
      equipment_model: listing.equipment_model,
      year: listing.year,
      pack_size: listing.pack_size,
      expiry_date: listing.expiry_date,
      service_area: listing.service_area,
    },
  })
}
