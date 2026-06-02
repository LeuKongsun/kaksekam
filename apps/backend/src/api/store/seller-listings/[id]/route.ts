import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  updateProductsWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows"

import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"

type UpdateSellerListingBody = {
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

type OwnedListingProduct = {
  id: string
  title: string
  description: string | null
  thumbnail: string | null
  images?: {
    url?: string | null
  }[]
  seller?: {
    id: string
    customer_id: string | null
  } | null
  listing?: {
    id: string
    status: string
    moderation_note: string | null
  } | null
  variants?: {
    id: string
  }[]
}

const PAGE_SIZE = 100
const EDITABLE_STATUSES = new Set([
  "draft",
  "pending_review",
  "active",
  "rejected",
])
const WITHDRAWABLE_STATUSES = new Set([
  "draft",
  "pending_review",
  "active",
  "rejected",
])

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

async function findOwnedListingProduct(
  query: any,
  listingId: string,
  customerId: string
): Promise<OwnedListingProduct | null> {
  let skip = 0
  let totalCount: number | undefined
  let hasMoreProducts = true

  while (hasMoreProducts) {
    const { data, metadata } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "description",
        "thumbnail",
        "images.url",
        "seller.id",
        "seller.customer_id",
        "listing.id",
        "listing.status",
        "listing.moderation_note",
        "variants.id",
      ],
      pagination: {
        skip,
        take: PAGE_SIZE,
      },
    })

    const product = (data as OwnedListingProduct[]).find(
      (candidate) =>
        candidate.listing?.id === listingId &&
        candidate.seller?.customer_id === customerId
    )

    if (product) {
      return product
    }

    totalCount = metadata?.count
    skip += data.length
    hasMoreProducts =
      data.length > 0 &&
      (totalCount === undefined ? data.length === PAGE_SIZE : skip < totalCount)
  }

  return null
}

export async function PATCH(
  req: AuthenticatedMedusaRequest<UpdateSellerListingBody>,
  res: MedusaResponse
) {
  const listingId = req.params.id
  const customerId = req.auth_context.actor_id
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const product = await findOwnedListingProduct(query, listingId, customerId)

  if (!product?.listing || !product.seller) {
    res.status(404).json({ message: "Listing not found." })
    return
  }

  if (!EDITABLE_STATUSES.has(product.listing.status)) {
    res.status(409).json({ message: "This listing cannot be edited." })
    return
  }

  const body = req.body
  const title = body.title?.trim()
  const description = body.description?.trim()
  const images = parseImageUrls(body.image_urls)
  const price = Number(body.price ?? 0)
  const currencyCode = (body.currency_code || "eur").toLowerCase()

  if (!title || !description || !Number.isFinite(price) || price <= 0) {
    res.status(400).json({
      message: "Title, description, and a positive price are required.",
    })
    return
  }

  await updateProductsWorkflow(req.scope).run({
    input: {
      products: [
        {
          id: product.id,
          title,
          description,
          thumbnail: images[0]?.url,
          images,
        },
      ],
    },
  })

  const variantId = product.variants?.[0]?.id

  if (variantId) {
    await updateProductVariantsWorkflow(req.scope).run({
      input: {
        product_variants: [
          {
            id: variantId,
            prices: [
              {
                amount: price,
                currency_code: currencyCode,
              },
            ],
          },
        ],
      },
    })
  }

  const listing = await marketplaceService.updateListings({
    id: product.listing.id,
    status: "pending_review",
    moderation_note: null,
    reviewed_at: null,
    reviewer_id: null,
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

  res.json({ listing })
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const listingId = req.params.id
  const customerId = req.auth_context.actor_id
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const product = await findOwnedListingProduct(query, listingId, customerId)

  if (!product?.listing) {
    res.status(404).json({ message: "Listing not found." })
    return
  }

  if (!WITHDRAWABLE_STATUSES.has(product.listing.status)) {
    res.status(409).json({ message: "This listing cannot be withdrawn." })
    return
  }

  const listing = await marketplaceService.updateListings({
    id: product.listing.id,
    status: "expired",
    moderation_note: null,
    reviewed_at: null,
    reviewer_id: null,
  })

  res.json({ listing })
}
