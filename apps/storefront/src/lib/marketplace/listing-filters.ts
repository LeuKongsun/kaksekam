import type { StoreProductWithListing } from "@lib/data/products"
import { richTextToPlainText } from "@lib/util/rich-text"

export type ListingSearchFilters = {
  query?: string | null
  category?: string | null
  location?: string | null
  condition?: string | null
}

export const normalizeFilterValue = (value?: string | null) => {
  const cleaned = value
    ?.normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ")

  return cleaned || null
}

const categoryAliases: Record<string, string> = {
  seed: "seeds",
  tool: "tools",
  service: "services",
  "កសិផល": "produce",
  "បន្លែ": "produce",
  "ផ្លែឈើ": "produce",
  "សត្វចិញ្ចឹម": "livestock",
  "គ្រាប់ពូជ": "seeds",
  "ជី": "fertilizer",
  "ឧបករណ៍": "equipment",
  "សេវាកម្ម": "services",
}

const searchAliasGroups = [
  ["produce", "farm product", "កសិផល", "បន្លែ", "ផ្លែឈើ"],
  ["livestock", "animal", "សត្វចិញ្ចឹម", "គោ", "ជ្រូក", "មាន់"],
  ["seeds", "seed", "គ្រាប់ពូជ", "ពូជ"],
  ["fertilizer", "ជី"],
  ["equipment", "machine", "ឧបករណ៍", "ម៉ាស៊ីន"],
  ["tools", "tool", "ឧបករណ៍ដៃ"],
  ["services", "service", "សេវាកម្ម"],
] as const

const expandSearchAliases = (value: string) => {
  const aliases = searchAliasGroups
    .filter((group) => group.some((alias) => value.includes(alias)))
    .flat()

  return aliases.length ? `${value} ${aliases.join(" ")}` : value
}

const normalizeCategoryValue = (value?: string | null) => {
  const normalized = normalizeFilterValue(value)

  return normalized ? categoryAliases[normalized] ?? normalized : null
}

export const buildListingSearchText = (product: StoreProductWithListing) => {
  const listing = product.listing

  return expandSearchAliases(
    [
      product.title,
      product.subtitle,
      richTextToPlainText(product.description),
      listing?.category,
      listing?.location,
      listing?.district,
      listing?.quantity,
      listing?.unit,
      listing?.minimum_order,
      listing?.condition,
      listing?.availability,
      listing?.production_method,
      ...(product.tags?.map((tag) => tag.value) ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .normalize("NFKC")
      .toLowerCase()
  )
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
  const normalizedQueryValue = normalizeFilterValue(filters.query)
  const normalizedQuery = normalizedQueryValue
    ? expandSearchAliases(normalizedQueryValue)
    : null
  const listing = product.listing

  const categoryMatches =
    !normalizedCategory ||
    normalizeCategoryValue(listing?.category) ===
      normalizeCategoryValue(normalizedCategory)

  const locationMatches =
    !normalizedLocation ||
    Boolean(
      normalizeFilterValue(listing?.location)?.includes(normalizedLocation) ||
        normalizeFilterValue(listing?.district)?.includes(normalizedLocation)
    )

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
