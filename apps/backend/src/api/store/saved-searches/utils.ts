type SavedSearchFilters = {
  query?: string | null
  category?: string | null
  location?: string | null
  condition?: string | null
}

type SearchableListingProduct = {
  title?: string | null
  subtitle?: string | null
  description?: string | null
  listing?: {
    status?: string | null
    category?: string | null
    location?: string | null
    quantity?: string | null
    unit?: string | null
    condition?: string | null
  } | null
  tags?: {
    value?: string | null
  }[]
}

export const cleanOptionalText = (value?: string) => {
  const cleaned = value?.trim()

  return cleaned || null
}

export const getDefaultSavedSearchName = (filters: SavedSearchFilters) => {
  const parts = [
    filters.query,
    filters.category,
    filters.location,
    filters.condition,
  ]
    .map((value) => value?.trim())
    .filter(Boolean)

  return parts.length ? parts.join(" / ") : "All listings"
}

export const productMatchesSavedSearch = (
  product: SearchableListingProduct,
  filters: SavedSearchFilters
) => {
  if (product.listing?.status !== "active") {
    return false
  }

  const normalizedCategory = filters.category?.trim().toLowerCase()
  const normalizedLocation = filters.location?.trim().toLowerCase()
  const normalizedCondition = filters.condition?.trim().toLowerCase()
  const normalizedQuery = filters.query?.trim().toLowerCase()
  const categoryMatches =
    !normalizedCategory ||
    product.listing?.category?.toLowerCase() === normalizedCategory
  const locationMatches =
    !normalizedLocation ||
    product.listing?.location?.toLowerCase().includes(normalizedLocation)
  const conditionMatches =
    !normalizedCondition ||
    product.listing?.condition?.toLowerCase().includes(normalizedCondition)
  const searchText = [
    product.title,
    product.subtitle,
    product.description,
    product.listing?.category,
    product.listing?.location,
    product.listing?.quantity,
    product.listing?.unit,
    product.listing?.condition,
    ...(product.tags?.map((tag) => tag.value) ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  const queryMatches = !normalizedQuery || searchText.includes(normalizedQuery)

  return (
    categoryMatches &&
    locationMatches &&
    conditionMatches &&
    queryMatches
  )
}
