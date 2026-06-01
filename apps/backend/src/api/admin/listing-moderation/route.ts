import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type ModerationProduct = {
  id: string
  title: string
  handle: string
  description: string | null
  thumbnail: string | null
  listing?: {
    id: string
    status: string
    moderation_note: string | null
    category: string | null
    location: string | null
    quantity: string | null
    unit: string | null
    availability: string | null
    condition: string | null
    contact_preference: string | null
    created_at: string
    updated_at: string
  } | null
  seller?: {
    id: string
    display_name: string
    email: string | null
    phone: string | null
    location: string | null
    verification_status: string
  } | null
  variants?: {
    prices?: {
      amount?: number
      currency_code?: string
    }[]
  }[]
}

const PAGE_SIZE = 100
const MODERATION_STATUSES = new Set(["pending_review", "rejected", "active"])

const getListingPrice = (product: ModerationProduct) => {
  const price = product.variants?.[0]?.prices?.[0]

  return price
    ? {
        calculated_amount: price.amount,
        currency_code: price.currency_code,
      }
    : null
}

async function listModerationProducts(query: any) {
  const products: ModerationProduct[] = []
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
        "listing.id",
        "listing.status",
        "listing.moderation_note",
        "listing.category",
        "listing.location",
        "listing.quantity",
        "listing.unit",
        "listing.availability",
        "listing.condition",
        "listing.contact_preference",
        "listing.created_at",
        "listing.updated_at",
        "seller.id",
        "seller.display_name",
        "seller.email",
        "seller.phone",
        "seller.location",
        "seller.verification_status",
        "variants.prices.amount",
        "variants.prices.currency_code",
      ],
      pagination: {
        skip,
        take: PAGE_SIZE,
      },
    })

    products.push(
      ...data.filter(
        (product: ModerationProduct) =>
          product.listing && MODERATION_STATUSES.has(product.listing.status)
      )
    )

    totalCount = metadata?.count
    skip += data.length
    hasMoreProducts =
      data.length > 0 &&
      (totalCount === undefined ? data.length === PAGE_SIZE : skip < totalCount)
  }

  return products
}

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const query = _req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const products = await listModerationProducts(query)

  res.json({
    listings: products.map((product) => ({
      id: product.listing!.id,
      product_id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      thumbnail: product.thumbnail,
      status: product.listing!.status,
      moderation_note: product.listing!.moderation_note,
      category: product.listing!.category,
      location: product.listing!.location,
      quantity: product.listing!.quantity,
      unit: product.listing!.unit,
      availability: product.listing!.availability,
      condition: product.listing!.condition,
      contact_preference: product.listing!.contact_preference,
      created_at: product.listing!.created_at,
      updated_at: product.listing!.updated_at,
      seller: product.seller ?? null,
      price: getListingPrice(product),
    })),
  })
}
