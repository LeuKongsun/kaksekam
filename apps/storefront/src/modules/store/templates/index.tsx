import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import SaveSearchButton from "@modules/store/components/save-search-button"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  category,
  location,
  availability,
  condition,
  q,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  category?: string
  location?: string
  availability?: string
  condition?: string
  q?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const quickFilters = [
    "Produce",
    "Livestock",
    "Seeds",
    "Fertilizer",
    "Equipment",
    "Tools",
    "Services",
  ]

  return (
    <div className="bg-white">
      <div className="content-container py-5 small:py-7">
        <div className="mx-auto max-w-5xl">
          <RefinementList
            sortBy={sort}
            category={category}
            location={location}
            availability={availability}
            condition={condition}
            q={q}
          />
        </div>

        <div className="mt-6 border-b border-gray-200">
          <div className="flex gap-6 overflow-x-auto pb-3">
            {quickFilters.map((filter) => {
              const isActive = category === filter

              return (
                <a
                  key={filter}
                  href={`/${countryCode}/store?category=${encodeURIComponent(filter)}`}
                  className={`min-w-fit border-b-2 px-1 pb-3 text-small-semi transition-colors ${
                    isActive
                      ? "border-ui-fg-base text-ui-fg-base"
                      : "border-transparent text-ui-fg-subtle hover:border-gray-300 hover:text-ui-fg-base"
                  }`}
                >
                  {filter}
                </a>
              )
            })}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h1
                className="text-xl-semi text-ui-fg-base"
                data-testid="store-page-title"
              >
                Farming listings
              </h1>
              <p className="mt-1 text-small-regular text-ui-fg-subtle">
                Contact farmers directly about products, pickup, and supply.
              </p>
            </div>
            <div className="hidden flex-col items-end gap-2 small:flex">
              <a
                href={`/${countryCode}/account/listings`}
                className="rounded-full border border-gray-300 px-4 py-2 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base"
              >
                Post listing
              </a>
              <SaveSearchButton
                countryCode={countryCode}
                q={q}
                category={category}
                location={location}
                availability={availability}
                condition={condition}
              />
            </div>
          </div>
          <div className="mb-5 small:hidden">
            <SaveSearchButton
              countryCode={countryCode}
              q={q}
              category={category}
              location={location}
              availability={availability}
              condition={condition}
            />
          </div>
          <div
            className="w-full"
            data-testid="category-container"
          >
            <Suspense fallback={<SkeletonProductGrid />}>
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                category={category}
                location={location}
                availability={availability}
                condition={condition}
                q={q}
                countryCode={countryCode}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
