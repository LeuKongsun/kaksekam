import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type ModerationProduct = {
  id: string
  title: string
  handle: string
  description: string | null
  thumbnail: string | null
  images?: {
    url: string
  }[] | null
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
    condition: string | null
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

type ReviewerUser = {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
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
        "images.url",
        "listing.id",
        "listing.status",
        "listing.moderation_note",
        "listing.reviewed_at",
        "listing.reviewer_id",
        "listing.category",
        "listing.location",
        "listing.quantity",
        "listing.unit",
        "listing.condition",
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
          product.listing?.category &&
          MODERATION_STATUSES.has(product.listing.status)
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

async function listReviewerUsers(query: any, reviewerIds: string[]) {
  if (!reviewerIds.length) {
    return new Map<string, ReviewerUser>()
  }

  try {
    const { data } = await query.graph({
      entity: "user",
      fields: ["id", "email", "first_name", "last_name"],
      filters: {
        id: reviewerIds,
      },
      pagination: {
        skip: 0,
        take: reviewerIds.length,
      },
    })

    return new Map(
      (data as ReviewerUser[]).map((user) => [
        user.id,
        {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
        },
      ])
    )
  } catch {
    return new Map<string, ReviewerUser>()
  }
}

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const query = _req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const products = await listModerationProducts(query)
  const reviewerIds = Array.from(
    new Set(
      products
        .map((product) => product.listing?.reviewer_id)
        .filter((id): id is string => Boolean(id))
    )
  )
  const reviewersById = await listReviewerUsers(query, reviewerIds)

  res.json({
    listings: products.map((product) => ({
      id: product.listing!.id,
      product_id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      thumbnail: product.thumbnail,
      images: product.images ?? [],
      status: product.listing!.status,
      moderation_note: product.listing!.moderation_note,
      reviewed_at: product.listing!.reviewed_at,
      reviewer_id: product.listing!.reviewer_id,
      reviewer: product.listing!.reviewer_id
        ? reviewersById.get(product.listing!.reviewer_id) ?? null
        : null,
      category: product.listing!.category,
      location: product.listing!.location,
      quantity: product.listing!.quantity,
      unit: product.listing!.unit,
      condition: product.listing!.condition,
      created_at: product.listing!.created_at,
      updated_at: product.listing!.updated_at,
      seller: product.seller ?? null,
      price: getListingPrice(product),
    })),
  })
}
