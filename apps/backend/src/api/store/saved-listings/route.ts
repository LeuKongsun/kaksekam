import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

type SaveListingBody = {
  product_id?: string
}

type SavedProduct = {
  id: string
  title: string
  handle: string
  description: string | null
  thumbnail: string | null
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
  seller?: {
    display_name: string
    location: string | null
  } | null
  variants?: {
    prices?: {
      amount?: number
      currency_code?: string
    }[]
  }[]
}

const getListingPrice = (product: SavedProduct) => {
  const price = product.variants?.[0]?.prices?.[0]

  return price
    ? {
        calculated_amount: price.amount,
        currency_code: price.currency_code,
      }
    : null
}

async function getActiveProductListing(query: any, productId: string) {
  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "listing.id", "listing.status"],
    filters: {
      id: productId,
    },
  })

  const product = data[0] as SavedProduct | undefined

  if (!product?.listing || product.listing.status !== "active") {
    return null
  }

  return product
}

async function hydrateSavedProducts(query: any, productIds: string[]) {
  if (!productIds.length) {
    return []
  }

  const { data } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "description",
      "thumbnail",
      "listing.id",
      "listing.status",
      "listing.category",
      "listing.location",
      "listing.quantity",
      "listing.unit",
      "listing.availability",
      "listing.condition",
      "listing.contact_preference",
      "seller.display_name",
      "seller.location",
      "variants.prices.amount",
      "variants.prices.currency_code",
    ],
    filters: {
      id: productIds,
    },
  })

  return data as SavedProduct[]
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const customerId = req.auth_context.actor_id
  const productId = req.query.product_id as string | undefined

  const savedListings = await marketplaceService.listSavedListings({
    customer_id: customerId,
    ...(productId ? { product_id: productId } : {}),
  })
  const products = await hydrateSavedProducts(
    query,
    savedListings.map((savedListing) => savedListing.product_id)
  )
  const productsById = new Map(products.map((product) => [product.id, product]))

  res.json({
    saved_listings: savedListings
      .map((savedListing) => {
        const product = productsById.get(savedListing.product_id)

        if (!product || product.listing?.status !== "active") {
          return null
        }

        return {
          id: savedListing.id,
          product_id: savedListing.product_id,
          listing_id: savedListing.listing_id,
          created_at: savedListing.created_at,
          product: {
            id: product.id,
            title: product.title,
            handle: product.handle,
            description: product.description,
            thumbnail: product.thumbnail,
            listing: product.listing,
            seller: product.seller ?? null,
            price: getListingPrice(product),
          },
        }
      })
      .filter(Boolean),
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<SaveListingBody>,
  res: MedusaResponse
) {
  const productId = req.body.product_id

  if (!productId) {
    res.status(400).json({ message: "Product ID is required." })
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const customerId = req.auth_context.actor_id
  const product = await getActiveProductListing(query, productId)

  if (!product?.listing?.id) {
    res.status(404).json({ message: "Active listing not found." })
    return
  }

  const [existingSavedListing] = await marketplaceService.listSavedListings({
    customer_id: customerId,
    product_id: productId,
  })

  if (existingSavedListing) {
    res.status(200).json({ saved_listing: existingSavedListing })
    return
  }

  const savedListing = await marketplaceService.createSavedListings({
    customer_id: customerId,
    product_id: productId,
    listing_id: product.listing.id,
  })

  res.status(201).json({ saved_listing: savedListing })
}
