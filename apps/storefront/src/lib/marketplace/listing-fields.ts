export const LISTING_CATEGORIES = [
  "Produce",
  "Livestock",
  "Seeds",
  "Fertilizer",
  "Equipment",
  "Tools",
  "Services",
  "Other",
] as const

export type ListingCategory = (typeof LISTING_CATEGORIES)[number]

export const LISTING_LOCATIONS = [
  "Phnom Penh",
  "Battambang",
  "Kampong Cham",
  "Kampong Chhnang",
  "Kampong Speu",
  "Kampong Thom",
  "Kandal",
  "Kampot",
  "Koh Kong",
  "Oddar Meanchey",
  "Pailin",
  "Preah Sihanouk",
  "Preah Vihear",
  "Ratanakiri",
  "Stung Treng",
  "Takeo",
  "Siem Reap",
  "Tboung Khmum",
  "Pursat",
  "Kratie",
  "Prey Veng",
  "Svay Rieng",
  "Banteay Meanchey",
  "Mondulkiri",
  "Kep",
] as const

export const LISTING_CONDITIONS = ["Fresh", "Organic", "Used", "New"] as const

export type ListingCondition = (typeof LISTING_CONDITIONS)[number]

export const LISTING_AVAILABILITY_OPTIONS = [
  "Ready now",
  "This week",
  "Pre-order",
] as const

export const LISTING_PRODUCTION_METHODS = [
  "Organic",
  "Conventional",
  "Regenerative",
] as const

export const LISTING_CONTACT_PREFERENCES = [
  "telegram",
  "messenger",
  "phone",
] as const
