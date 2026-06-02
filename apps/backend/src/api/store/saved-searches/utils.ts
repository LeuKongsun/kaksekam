type SavedSearchFilters = {
  query?: string | null
  category?: string | null
  location?: string | null
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
    availability?: string | null
    condition?: string | null
    contact_preference?: string | null
    variety?: string | null
    production_method?: string | null
    harvest_date?: string | null
    breed?: string | null
    age?: string | null
    sex?: string | null
    health_notes?: string | null
    brand?: string | null
    equipment_model?: string | null
    year?: string | null
    pack_size?: string | null
    expiry_date?: string | null
    service_area?: string | null
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
  const parts = [filters.query, filters.category, filters.location]
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
  const normalizedQuery = filters.query?.trim().toLowerCase()
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
}
