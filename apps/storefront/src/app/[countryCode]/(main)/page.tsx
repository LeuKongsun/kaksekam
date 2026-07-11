import { Metadata } from "next"

import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getTranslations } from "@lib/i18n/server"
import { LISTING_CATEGORIES } from "@lib/marketplace/listing-fields"
import Hero from "@modules/home/components/hero"
import ProductPreview from "@modules/products/components/product-preview"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export const metadata: Metadata = {
  title: "Kaksephal",
  description:
    "Find farming products near you. Browse produce, livestock, seeds, tools, and equipment from local farmers and contact sellers directly.",
}

const HOME_LISTINGS_LIMIT = 4
const FILTERED_LISTINGS_LIMIT = 100
const HOME_CATEGORY_LIMIT = 6
const HOME_CATEGORY_SHELVES = LISTING_CATEGORIES.slice(0, HOME_CATEGORY_LIMIT)

type Params = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    category?: string
    location?: string
    condition?: string
    q?: string
  }>
}

export default async function Home(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams

  if (!params.countryCode) {
    return null
  }

  const { t } = await getTranslations()
  const filters = {
    category: cleanFilter(searchParams.category),
    location: cleanFilter(searchParams.location),
    condition: cleanFilter(searchParams.condition),
    q: cleanFilter(searchParams.q),
    sortBy: searchParams.sortBy || "created_at",
  }
  const hasFilters = Boolean(
    filters.category ||
      filters.location ||
      filters.condition ||
      filters.q ||
      filters.sortBy !== "created_at"
  )

  return (
    <main className="bg-white">
      <Hero
        countryCode={params.countryCode}
        labels={t.home}
        storeLabels={t.store}
      />
      <div className="content-container py-7 small:py-10">
        {hasFilters ? (
          <div className="mx-auto w-full max-w-[1120px]">
            <ListingShelf
              title={t.store.title}
              category={filters.category}
              location={filters.location}
              condition={filters.condition}
              q={filters.q}
              sortBy={filters.sortBy}
              countryCode={params.countryCode}
              emptyTitle={t.store.noListingsTitle}
              emptyDescription={t.store.noListingsDescription}
              limit={FILTERED_LISTINGS_LIMIT}
            />
          </div>
        ) : (
          <div className="mx-auto grid w-full max-w-[1120px] gap-8 small:gap-10">
            <ListingShelf
              title={t.home.latestListings}
              countryCode={params.countryCode}
            />
            {HOME_CATEGORY_SHELVES.map((category) => {
              const categoryLabel =
                t.store.categories[
                  category as keyof typeof t.store.categories
                ] ?? category

              return (
                <ListingShelf
                  key={category}
                  title={categoryLabel}
                  category={category}
                  countryCode={params.countryCode}
                />
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

const cleanFilter = (value?: string) => {
  const cleaned = value?.trim()

  return cleaned || undefined
}

const ListingShelf = async ({
  title,
  category,
  location,
  condition,
  q,
  sortBy = "created_at",
  countryCode,
  emptyTitle,
  emptyDescription,
  limit = HOME_LISTINGS_LIMIT,
}: {
  title: string
  category?: string
  location?: string
  condition?: string
  q?: string
  sortBy?: SortOptions
  countryCode: string
  emptyTitle?: string
  emptyDescription?: string
  limit?: number
}) => {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products },
  } = await listProductsWithSort({
    page: 1,
    queryParams: { limit },
    sortBy,
    listingCategory: category,
    listingLocation: location,
    listingCondition: condition,
    listingQuery: q,
    countryCode,
  })

  if (products.length === 0) {
    if (emptyTitle) {
      return (
        <div className="rounded-md border border-gray-200 bg-white p-8 text-center">
          <h2 className="text-base-semi text-ui-fg-base">{emptyTitle}</h2>
          {emptyDescription && (
            <p className="mt-2 text-small-regular text-ui-fg-subtle">
              {emptyDescription}
            </p>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <section className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0 small:pb-10">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl-semi text-ui-fg-base">{title}</h2>
      </div>
      <ul className="grid w-full grid-cols-2 gap-x-3 gap-y-5 small:gap-x-5 small:gap-y-7 medium:grid-cols-4">
        {products.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} />
          </li>
        ))}
      </ul>
    </section>
  )
}
