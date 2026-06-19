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
    avatar_url: string | null
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
        "seller.avatar_url",
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
  const [seller] = await marketplaceService.listSellers({ handle })

  if (!seller || seller.status !== "active") {
    res.status(404).json({ message: "Seller not found." })
    return
  }

  const products = await listActiveProductsForSeller(query, handle)

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
      price: getListingPrice(product),
    })),
  })
}
