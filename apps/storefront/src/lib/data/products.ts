"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

export type ProductSeller = {
  id: string
  display_name: string
  handle: string
  email: string | null
  phone: string | null
  location: string | null
  bio: string | null
  status: "active" | "suspended"
  verification_status?: "unverified" | "verified"
  created_at?: string
  trust_stats?: {
    profile_completeness: number
    inquiry_count: number
    replied_inquiry_count: number
    reply_rate: number | null
  }
}

export type StoreProductWithListing = HttpTypes.StoreProduct & {
  listing?: {
    id: string
    status: "draft" | "pending_review" | "active" | "sold" | "rejected" | "expired"
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
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: StoreProductWithListing[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  return sdk.client
    .fetch<{ products: StoreProductWithListing[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,+listing.id,+listing.status,+listing.category,+listing.location,+listing.quantity,+listing.unit,+listing.availability,+listing.condition,+listing.contact_preference,+listing.variety,+listing.production_method,+listing.harvest_date,+listing.breed,+listing.age,+listing.sex,+listing.health_notes,+listing.brand,+listing.equipment_model,+listing.year,+listing.pack_size,+listing.expiry_date,+listing.service_area,",
          ...queryParams,
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ products, count }) => {
      const activeProducts = products.filter(
        (product) => product.listing?.status === "active"
      )
      const activeCount = activeProducts.length
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products: activeProducts,
          count: activeCount,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

export const retrieveProductSeller = async (
  productId: string
): Promise<ProductSeller | null> => {
  return sdk.client
    .fetch<{ seller: ProductSeller | null }>(
      `/store/products/${productId}/seller`,
      {
        method: "GET",
        cache: "no-store",
      }
    )
    .then(({ seller }) => seller)
}

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  listingCategory,
  listingLocation,
  listingQuery,
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  listingCategory?: string
  listingLocation?: string
  listingQuery?: string
  countryCode: string
}): Promise<{
  response: { products: StoreProductWithListing[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12

  const {
    response: { products },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const normalizedCategory = listingCategory?.trim().toLowerCase()
  const normalizedLocation = listingLocation?.trim().toLowerCase()
  const normalizedQuery = listingQuery?.trim().toLowerCase()
  const filteredProducts = products.filter((product) => {
    const categoryMatches =
      !normalizedCategory ||
      product.listing?.category?.toLowerCase() === normalizedCategory
    const locationMatches =
      !normalizedLocation ||
      product.listing?.location?.toLowerCase().includes(normalizedLocation)
    const searchText = [
      product.title,
      product.subtitle,
      product.description,
      product.listing?.category,
      product.listing?.location,
      product.listing?.quantity,
      product.listing?.unit,
      product.listing?.availability,
      product.listing?.condition,
      product.listing?.contact_preference,
      product.listing?.variety,
      product.listing?.production_method,
      product.listing?.harvest_date,
      product.listing?.breed,
      product.listing?.age,
      product.listing?.sex,
      product.listing?.health_notes,
      product.listing?.brand,
      product.listing?.equipment_model,
      product.listing?.year,
      product.listing?.pack_size,
      product.listing?.expiry_date,
      product.listing?.service_area,
      ...(product.tags?.map((tag) => tag.value) ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    const queryMatches = !normalizedQuery || searchText.includes(normalizedQuery)

    return categoryMatches && locationMatches && queryMatches
  })
  const sortedProducts = sortProducts(filteredProducts, sortBy)

  const pageParam = (page - 1) * limit

  const filteredCount = filteredProducts.length
  const nextPage = filteredCount > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count: filteredCount,
    },
    nextPage,
    queryParams,
  }
}
