import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"
import {
  cleanOptionalText,
  getDefaultSavedSearchName,
  productMatchesSavedSearch,
} from "./utils"

type SaveSearchBody = {
  name?: string
  query?: string
  category?: string
  location?: string
}

type SearchProduct = {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  listing?: {
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
  tags?: {
    value?: string | null
  }[]
}

const PAGE_SIZE = 100

async function listSearchProducts(query: any) {
  const products: SearchProduct[] = []
  let skip = 0
  let totalCount: number | undefined
  let hasMoreProducts = true

  while (hasMoreProducts) {
    const { data, metadata } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "subtitle",
        "description",
        "tags.value",
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
      ],
      pagination: {
        skip,
        take: PAGE_SIZE,
      },
    })

    products.push(...(data as SearchProduct[]))

    totalCount = metadata?.count
    skip += data.length
    hasMoreProducts =
      data.length > 0 &&
      (totalCount === undefined ? data.length === PAGE_SIZE : skip < totalCount)
  }

  return products
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const customerId = req.auth_context.actor_id
  const [savedSearches, products] = await Promise.all([
    marketplaceService.listSavedSearches({
      customer_id: customerId,
    }),
    listSearchProducts(query),
  ])

  res.json({
    saved_searches: savedSearches
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((savedSearch) => ({
        ...savedSearch,
        match_count: products.filter((product) =>
          productMatchesSavedSearch(product, savedSearch)
        ).length,
      })),
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<SaveSearchBody>,
  res: MedusaResponse
) {
  const body = req.body
  const customerId = req.auth_context.actor_id
  const query = cleanOptionalText(body.query)
  const category = cleanOptionalText(body.category)
  const location = cleanOptionalText(body.location)

  if (!query && !category && !location) {
    res.status(400).json({ message: "Add at least one search filter to save." })
    return
  }

  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const existing = await marketplaceService.listSavedSearches({
    customer_id: customerId,
    query,
    category,
    location,
  })

  if (existing[0]) {
    res.status(200).json({ saved_search: existing[0] })
    return
  }

  const savedSearch = await marketplaceService.createSavedSearches({
    customer_id: customerId,
    name: body.name?.trim() || getDefaultSavedSearchName(body),
    query,
    category,
    location,
  })

  res.status(201).json({ saved_search: savedSearch })
}
