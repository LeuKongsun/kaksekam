export const supportedLocales = [
  { code: "en", name: "English" },
  { code: "km", name: "Khmer" },
] as const

export type SupportedLocale = (typeof supportedLocales)[number]["code"]

export const defaultLocale: SupportedLocale = "en"

export const normalizeLocale = (locale?: string | null): SupportedLocale => {
  if (!locale) {
    return defaultLocale
  }

  const language = locale.toLowerCase().split(/[-_]/)[0]

  return language === "km" ? "km" : defaultLocale
}

export const translations = {
  en: {
    common: {
      brand: "Farm Marketplace",
      browse: "Browse",
      sell: "Sell",
      account: "Account",
      signIn: "Sign in",
      listings: "Listings",
      myListings: "My listings",
      inquiries: "Inquiries",
      menu: "Menu",
      language: "Language",
      defaultLanguage: "Default",
      allRightsReserved: "All rights reserved.",
    },
    footer: {
      description:
        "A straightforward place to find local agriculture listings, contact sellers, and keep farm supply moving with confidence.",
      trustSignals: [
        "Verified seller profiles",
        "Direct buyer inquiries",
        "Local farm supply network",
      ],
      browseListings: "Browse listings",
      postListing: "Post a listing",
    },
    store: {
      title: "Browse listings",
      description: "Find products from local farmers and suppliers.",
      searchListings: "Search listings",
      searchPlaceholder: "Search",
      allCategories: "All categories",
      filters: "Filters",
      location: "Location",
      sort: "Sort",
      availability: "Availability",
      condition: "Condition",
      ok: "OK",
      noListingsTitle: "No listings found",
      noListingsDescription: "Try a different keyword, category, or location.",
      categories: {
        Produce: "Produce",
        Livestock: "Livestock",
        Seeds: "Seeds",
        Fertilizer: "Fertilizer",
        Equipment: "Equipment",
        Tools: "Tools",
        Services: "Services",
        Other: "Other",
      },
      sortOptions: {
        created_at: "Latest",
        price_asc: "Price low to high",
        price_desc: "Price high to low",
      },
      availabilityOptions: {
        any: "Any time",
        "Ready now": "Ready now",
        "This week": "This week",
        "This month": "This month",
        "Pre-order": "Pre-order",
      },
      conditionOptions: {
        any: "Any condition",
        New: "New",
        Used: "Used",
        Fresh: "Fresh",
        Organic: "Organic",
        Conventional: "Conventional",
      },
    },
  },
  km: {
    common: {
      brand: "ផ្សារកសិកម្ម",
      browse: "រកមើល",
      sell: "លក់",
      account: "គណនី",
      signIn: "ចូលគណនី",
      listings: "បញ្ជីទំនិញ",
      myListings: "បញ្ជីរបស់ខ្ញុំ",
      inquiries: "សំណួរ",
      menu: "ម៉ឺនុយ",
      language: "ភាសា",
      defaultLanguage: "លំនាំដើម",
      allRightsReserved: "រក្សាសិទ្ធិគ្រប់យ៉ាង។",
    },
    footer: {
      description:
        "កន្លែងងាយស្រួលសម្រាប់ស្វែងរកបញ្ជីទំនិញកសិកម្មក្នុងតំបន់ ទាក់ទងអ្នកលក់ និងរក្សាខ្សែផ្គត់ផ្គង់កសិកម្មឱ្យដំណើរការដោយទំនុកចិត្ត។",
      trustSignals: [
        "ប្រវត្តិអ្នកលក់បានផ្ទៀងផ្ទាត់",
        "សំណួរអ្នកទិញដោយផ្ទាល់",
        "បណ្តាញផ្គត់ផ្គង់កសិកម្មក្នុងតំបន់",
      ],
      browseListings: "រកមើលបញ្ជីទំនិញ",
      postListing: "ដាក់បញ្ជីទំនិញ",
    },
    store: {
      title: "រកមើលបញ្ជីទំនិញ",
      description: "ស្វែងរកផលិតផលពីកសិករ និងអ្នកផ្គត់ផ្គង់ក្នុងតំបន់។",
      searchListings: "ស្វែងរកបញ្ជីទំនិញ",
      searchPlaceholder: "ស្វែងរក",
      allCategories: "ប្រភេទទាំងអស់",
      filters: "តម្រង",
      location: "ទីតាំង",
      sort: "តម្រៀប",
      availability: "ភាពអាចរកបាន",
      condition: "លក្ខខណ្ឌ",
      ok: "យល់ព្រម",
      noListingsTitle: "រកមិនឃើញបញ្ជីទំនិញ",
      noListingsDescription: "សាកល្បងពាក្យគន្លឹះ ប្រភេទ ឬទីតាំងផ្សេងទៀត។",
      categories: {
        Produce: "ផលិតផលកសិកម្ម",
        Livestock: "សត្វចិញ្ចឹម",
        Seeds: "គ្រាប់ពូជ",
        Fertilizer: "ជី",
        Equipment: "ឧបករណ៍ធំ",
        Tools: "ឧបករណ៍",
        Services: "សេវាកម្ម",
        Other: "ផ្សេងៗ",
      },
      sortOptions: {
        created_at: "ថ្មីបំផុត",
        price_asc: "តម្លៃទាបទៅខ្ពស់",
        price_desc: "តម្លៃខ្ពស់ទៅទាប",
      },
      availabilityOptions: {
        any: "ពេលណាក៏បាន",
        "Ready now": "រួចរាល់ឥឡូវនេះ",
        "This week": "សប្តាហ៍នេះ",
        "This month": "ខែនេះ",
        "Pre-order": "កម្មង់ទុកជាមុន",
      },
      conditionOptions: {
        any: "លក្ខខណ្ឌណាក៏បាន",
        New: "ថ្មី",
        Used: "បានប្រើ",
        Fresh: "ស្រស់",
        Organic: "សរីរាង្គ",
        Conventional: "ធម្មតា",
      },
    },
  },
} as const

export type Translations = (typeof translations)[SupportedLocale]
export type StoreTranslations = Translations["store"]
