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
      brand: "Kaksephal",
      browse: "Browse",
      sell: "Sell",
      account: "Account",
      signIn: "Sign in",
      listings: "Listings",
      myListings: "My listings",
      messages: "Messages",
      saved: "Saved",
      inquiries: "Inquiries",
      menu: "Menu",
      language: "Language",
      defaultLanguage: "Default",
      allRightsReserved: "All rights reserved.",
    },
    home: {
      title: "Find farming products near you",
      subtitle:
        "Browse fresh produce, livestock, seeds, tools, supplies, and equipment from local farmers.",
      what: "What",
      whatPlaceholder: "Produce, tools, equipment",
      where: "Where",
      wherePlaceholder: "Province, district, farm",
      seller: "Seller",
      sellerValue: "Farmers and suppliers",
      search: "Search",
      postListing: "Post a listing",
      latestListings: "Recent listings",
      newConditionListings: "New condition",
      browseAll: "Browse all listings",
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
      search: "Search",
      clearFilters: "Clear filters",
      what: "What",
      whatPlaceholder: "Produce, tools, equipment",
      where: "Where",
      wherePlaceholder: "Province, district, farm",
      searchPlaceholder: "Search",
      allCategories: "All categories",
      filters: "More filters",
      location: "Location",
      sort: "Sort",
      condition: "Condition",
      applyFilters: "Apply filters",
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
      conditionOptions: {
        any: "Any condition",
        Fresh: "Fresh",
        Organic: "Organic",
        Used: "Used",
        New: "New",
      },
    },
  },
  km: {
    common: {
      brand: "កសិផល",
      browse: "រកមើល",
      sell: "លក់",
      account: "គណនី",
      signIn: "ចូលគណនី",
      listings: "បញ្ជីទំនិញ",
      myListings: "បញ្ជីរបស់ខ្ញុំ",
      messages: "សារ",
      saved: "បានរក្សាទុក",
      inquiries: "សំណួរ",
      menu: "ម៉ឺនុយ",
      language: "ភាសា",
      defaultLanguage: "លំនាំដើម",
      allRightsReserved: "រក្សាសិទ្ធិគ្រប់យ៉ាង។",
    },
    home: {
      title: "ស្វែងរកផលិតផលកសិកម្មនៅជិតអ្នក",
      subtitle:
        "រកមើលបន្លែផ្លែឈើស្រស់ សត្វចិញ្ចឹម គ្រាប់ពូជ ឧបករណ៍ និងសម្ភារៈពីកសិករក្នុងតំបន់។",
      what: "អ្វី",
      whatPlaceholder: "ផលិតផល ឧបករណ៍ សម្ភារៈ",
      where: "ទីណា",
      wherePlaceholder: "ខេត្ត ស្រុក កសិដ្ឋាន",
      seller: "អ្នកលក់",
      sellerValue: "កសិករ និងអ្នកផ្គត់ផ្គង់",
      search: "ស្វែងរក",
      postListing: "ដាក់បញ្ជីទំនិញ",
      latestListings: "បញ្ជីថ្មីៗ",
      newConditionListings: "លក្ខខណ្ឌថ្មី",
      browseAll: "រកមើលបញ្ជីទំនិញទាំងអស់",
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
      search: "ស្វែងរក",
      clearFilters: "លុបតម្រង",
      what: "អ្វី",
      whatPlaceholder: "ផលិតផល ឧបករណ៍ សម្ភារៈ",
      where: "ទីណា",
      wherePlaceholder: "ខេត្ត ស្រុក កសិដ្ឋាន",
      searchPlaceholder: "ស្វែងរក",
      allCategories: "ប្រភេទទាំងអស់",
      filters: "តម្រងបន្ថែម",
      location: "ទីតាំង",
      sort: "តម្រៀប",
      condition: "លក្ខខណ្ឌ",
      applyFilters: "អនុវត្តតម្រង",
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
      conditionOptions: {
        any: "លក្ខខណ្ឌណាក៏បាន",
        Fresh: "ស្រស់",
        Organic: "សរីរាង្គ",
        Used: "បានប្រើ",
        New: "ថ្មី",
      },
    },
  },
} as const

export type Translations = (typeof translations)[SupportedLocale]
export type StoreTranslations = Translations["store"]
export type HomeTranslations = Translations["home"]
