"use server"

import { sdk } from "@lib/config"
import { matchesListingFilters } from "@lib/marketplace/listing-filters"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { mockProducts } from "@modules/store/mock-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

export type ProductSeller = {
  id: string
  display_name: string
  handle: string
  email: string | null
  phone: string | null
  telegram: string | null
  facebook_url: string | null
  preferred_contact: "telegram" | "messenger" | "phone" | null
  location: string | null
  bio: string | null
  avatar_url: string | null
  status: "active" | "suspended"
  verification_status?: "unverified" | "verified"
  created_at?: string
  active_listing_count?: number
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
    district: string | null
    quantity: string | null
    unit: string | null
    minimum_order: string | null
    condition: string | null
    availability: string | null
    production_method: string | null
    contact_preference: "telegram" | "messenger" | "phone" | null
    negotiable: boolean
    expires_at: string | null
    refreshed_at: string | null
  } | null
}

// Demo sample listings. Disable by setting NEXT_PUBLIC_ENABLE_MOCK_LISTINGS=false.
const mockListingsEnabled =
  process.env.NEXT_PUBLIC_ENABLE_MOCK_LISTINGS !== "false"

const findMockProducts = (
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
) => {
  if (!mockListingsEnabled) {
    return []
  }

  if (queryParams?.handle) {
    return mockProducts.filter((product) => product.handle === queryParams.handle)
  }

  if (queryParams?.id?.length) {
    return mockProducts.filter((product) => queryParams.id?.includes(product.id))
  }

  return []
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
  const fields = [
    "*variants.calculated_price",
    "*variants.prices",
    "+variants.inventory_quantity",
    "*variants.images",
    "+metadata",
    "+tags",
    "+listing.id",
    "+listing.status",
    "+listing.category",
    "+listing.location",
    "+listing.district",
    "+listing.quantity",
    "+listing.unit",
    "+listing.minimum_order",
    "+listing.condition",
    "+listing.availability",
    "+listing.production_method",
    "+listing.contact_preference",
    "+listing.negotiable",
    "+listing.expires_at",
    "+listing.refreshed_at",
    queryParams?.fields,
  ]
    .filter(Boolean)
    .join(",")

  return sdk.client
    .fetch<{ products: StoreProductWithListing[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          ...queryParams,
          fields,
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ products, count }) => {
      const activeProducts = products.filter(
        (product) =>
          product.listing?.status === "active" &&
          product.listing.category &&
          (!product.listing.expires_at ||
            new Date(product.listing.expires_at).getTime() > Date.now())
      )
      const matchedMockProducts = findMockProducts(queryParams)
      const visibleProducts = [...activeProducts, ...matchedMockProducts]
      const activeCount = visibleProducts.length
      const nextPage = products.length === limit ? _pageParam + 1 : null

      return {
        response: {
          products: visibleProducts,
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

const LISTING_FETCH_PAGE_SIZE = 100

const listAllActiveProducts = async (
  countryCode: string
): Promise<StoreProductWithListing[]> => {
  const products: StoreProductWithListing[] = []
  let pageParam = 1

  while (true) {
    const { response, nextPage } = await listProducts({
      pageParam,
      queryParams: {
        limit: LISTING_FETCH_PAGE_SIZE,
      },
      countryCode,
    })

    products.push(...response.products)

    if (!nextPage) {
      break
    }

    pageParam = nextPage
  }

  return products
}

/**
 * Fetches active listings, applies marketplace filters against listing fields,
 * sorts the results, and paginates them for the browse page.
 */
export const listProductsWithSort = async ({
  page = 1,
  queryParams,
  sortBy = "created_at",
  listingCategory,
  listingLocation,
  listingCondition,
  listingQuery,
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  listingCategory?: string
  listingLocation?: string
  listingCondition?: string
  listingQuery?: string
  countryCode: string
}): Promise<{
  response: { products: StoreProductWithListing[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12
  const currentPage = Math.max(page, 1)
  const filters = {
    query: listingQuery,
    category: listingCategory,
    location: listingLocation,
    condition: listingCondition,
  }

  const activeProducts = await listAllActiveProducts(countryCode)
  const productsWithMockListings = mockListingsEnabled
    ? [
        ...activeProducts,
        ...mockProducts.filter((product) => product.listing?.status === "active"),
      ]
    : activeProducts
  const filteredProducts = productsWithMockListings.filter((product) =>
    matchesListingFilters(product, filters)
  )
  const sortedProducts = sortProducts(filteredProducts, sortBy)
  const offset = (currentPage - 1) * limit
  const filteredCount = filteredProducts.length
  const nextPage =
    filteredCount > offset + limit ? currentPage + 1 : null

  return {
    response: {
      products: sortedProducts.slice(offset, offset + limit),
      count: filteredCount,
    },
    nextPage,
    queryParams,
  }
}
