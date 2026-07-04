import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getTranslations } from "@lib/i18n/server"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  category,
  location,
  condition,
  q,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  category?: string
  location?: string
  condition?: string
  q?: string
  countryCode: string
}) => {
  const { t } = await getTranslations()
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const resultsKey = [
    sort,
    pageNumber,
    category ?? "",
    location ?? "",
    condition ?? "",
    q ?? "",
  ].join("|")

  return (
    <main className="bg-white">
      <div className="content-container py-5 small:py-8">
        <section className="mx-auto max-w-[1120px] border-b border-gray-200 pb-5 small:pb-6">
          <div>
            <div>
              <h1
                className="text-2xl-semi text-ui-fg-base"
                data-testid="store-page-title"
              >
                {t.store.title}
              </h1>
              <p className="mt-1 text-small-regular text-ui-fg-subtle">
                {t.store.description}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <RefinementList
              sortBy={sort}
              category={category}
              location={location}
              condition={condition}
              q={q}
              labels={t.store}
            />
          </div>
        </section>

        <section className="mt-6">
          <div className="w-full" data-testid="category-container">
            <Suspense key={resultsKey} fallback={<SkeletonProductGrid />}>
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                category={category}
                location={location}
                condition={condition}
                q={q}
                countryCode={countryCode}
                labels={t.store}
              />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  )
}

export default StoreTemplate
