import type { StoreProductWithListing } from "@lib/data/products"
import { richTextToPlainText } from "@lib/util/rich-text"

export type ListingSearchFilters = {
  query?: string | null
  category?: string | null
  location?: string | null
  condition?: string | null
}

export const normalizeFilterValue = (value?: string | null) => {
  const cleaned = value?.trim().toLowerCase()

  return cleaned || null
}

const categoryAliases: Record<string, string> = {
  seed: "seeds",
  tool: "tools",
  service: "services",
}

const normalizeCategoryValue = (value?: string | null) => {
  const normalized = normalizeFilterValue(value)

  return normalized ? categoryAliases[normalized] ?? normalized : null
}

export const buildListingSearchText = (product: StoreProductWithListing) => {
  const listing = product.listing

  return [
    product.title,
    product.subtitle,
    richTextToPlainText(product.description),
    listing?.category,
    listing?.location,
    listing?.quantity,
    listing?.unit,
    listing?.condition,
    ...(product.tags?.map((tag) => tag.value) ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

export const matchesListingFilters = (
  product: StoreProductWithListing,
  filters: ListingSearchFilters
) => {
  if (product.listing?.status !== "active") {
    return false
  }

  const normalizedCategory = normalizeFilterValue(filters.category)
  const normalizedLocation = normalizeFilterValue(filters.location)
  const normalizedCondition = normalizeFilterValue(filters.condition)
  const normalizedQuery = normalizeFilterValue(filters.query)
  const listing = product.listing

  const categoryMatches =
    !normalizedCategory ||
    normalizeCategoryValue(listing?.category) ===
      normalizeCategoryValue(normalizedCategory)

  const locationMatches =
    !normalizedLocation ||
    normalizeFilterValue(listing?.location)?.includes(normalizedLocation)

  const conditionMatches =
    !normalizedCondition ||
    normalizeFilterValue(listing?.condition)?.includes(normalizedCondition)

  const searchText = buildListingSearchText(product)
  const queryTokens = normalizedQuery?.split(/\s+/).filter(Boolean) ?? []
  const queryMatches =
    queryTokens.length === 0 ||
    queryTokens.every((token) => searchText.includes(token))

  return (
    categoryMatches &&
    locationMatches &&
    conditionMatches &&
    queryMatches
  )
}
