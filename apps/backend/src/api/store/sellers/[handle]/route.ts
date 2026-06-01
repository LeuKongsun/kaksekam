import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"
import { getSellerTrustStats } from "../utils"

type SellerProduct = {
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
    display_name: string
    handle: string
    email: string | null
    phone: string | null
    location: string | null
    bio: string | null
    status: string
    verification_status: string
    created_at: string
  } | null
  listing?: {
    id: string
    status: string
    category: string | null
    location: string | null
    quantity: string | null
    unit: string | null
    availability: string | null
    condition: string | null
    contact_preference: string | null
  } | null
  variants?: {
    prices?: {
      amount?: number
      currency_code?: string
    }[]
  }[]
}

const PAGE_SIZE = 100

const getListingPrice = (product: SellerProduct) => {
  const price = product.variants?.[0]?.prices?.[0]

  return price
    ? {
        calculated_amount: price.amount,
        currency_code: price.currency_code,
      }
    : null
}

async function listActiveProductsForSeller(query: any, handle: string) {
  const products: SellerProduct[] = []
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
        "seller.display_name",
        "seller.handle",
        "seller.email",
        "seller.phone",
        "seller.location",
        "seller.bio",
        "seller.status",
        "seller.verification_status",
        "seller.created_at",
        "listing.id",
        "listing.status",
        "listing.category",
        "listing.location",
        "listing.quantity",
        "listing.unit",
        "listing.availability",
        "listing.condition",
        "listing.contact_preference",
        "variants.prices.amount",
        "variants.prices.currency_code",
      ],
      pagination: {
        skip,
        take: PAGE_SIZE,
      },
    })

    products.push(
      ...(data as SellerProduct[]).filter(
        (product) =>
          product.seller?.handle === handle &&
          product.seller.status === "active" &&
          product.listing?.status === "active"
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

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const handle = req.params.handle
  const products = await listActiveProductsForSeller(query, handle)
  const seller = products[0]?.seller

  if (!seller) {
    res.status(404).json({ message: "Seller not found." })
    return
  }

  const inquiries = await marketplaceService.listListingInquiries({
    seller_id: seller.id,
  })

  res.json({
    seller: {
      ...seller,
      trust_stats: getSellerTrustStats(seller, inquiries),
    },
    listings: products.map((product) => ({
      id: product.listing!.id,
      product_id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      thumbnail: product.thumbnail,
      images: product.images ?? [],
      category: product.listing!.category,
      location: product.listing!.location,
      quantity: product.listing!.quantity,
      unit: product.listing!.unit,
      availability: product.listing!.availability,
      condition: product.listing!.condition,
      contact_preference: product.listing!.contact_preference,
      price: getListingPrice(product),
    })),
  })
}
