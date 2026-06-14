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
  const { t } = await getTranslations()
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const quickFilters: {
    label: ListingCategory
    icon: ListingCategoryIcon
  }[] = [
    { label: "Produce", icon: "produce" },
    { label: "Livestock", icon: "livestock" },
    { label: "Seeds", icon: "seeds" },
    { label: "Fertilizer", icon: "fertilizer" },
    { label: "Equipment", icon: "equipment" },
    { label: "Tools", icon: "tools" },
    { label: "Services", icon: "services" },
  ]

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
              availability={availability}
              condition={condition}
              q={q}
              labels={t.store}
            />
          </div>

          <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
            {quickFilters.map((filter) => {
              const isActive = category === filter.label

              return (
                <a
                  key={filter.label}
                  href={`/${countryCode}/store?category=${encodeURIComponent(
                    filter.label
                  )}`}
                  className={`flex min-w-fit items-center gap-2 rounded-full border px-3 py-2 text-small-semi transition-colors ${
                    isActive
                      ? "border-ui-fg-base bg-ui-fg-base text-white"
                      : "border-gray-200 bg-white text-ui-fg-subtle hover:border-gray-300 hover:text-ui-fg-base"
                  }`}
                >
                  <CategoryIcon icon={filter.icon} />
                  {t.store.categories[filter.label]}
                </a>
              )
            })}
          </div>
        </section>

        <section className="mt-6">
          <div className="w-full" data-testid="category-container">
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
                labels={t.store}
              />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  )
}

type ListingCategory =
  | "Produce"
  | "Livestock"
  | "Seeds"
  | "Fertilizer"
  | "Equipment"
  | "Tools"
  | "Services"

type ListingCategoryIcon =
  | "produce"
  | "livestock"
  | "seeds"
  | "fertilizer"
  | "equipment"
  | "tools"
  | "services"

const CategoryIcon = ({ icon }: { icon: ListingCategoryIcon }) => {
  const iconProps = {
    className: "h-4 w-4 shrink-0",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  }

  if (icon === "produce") {
    return (
      <svg {...iconProps}>
        <path d="M12 7c3 0 6 2.5 6 6a6 6 0 0 1-12 0c0-3.5 3-6 6-6Z" />
        <path d="M12 7c0-2 1.5-3.5 3.5-3.5" />
        <path d="M10 6c-2.2-.2-3.8-1.1-4.5-2.5 2.4-.3 4 .5 4.5 2.5Z" />
      </svg>
    )
  }

  if (icon === "livestock") {
    return (
      <svg {...iconProps}>
        <path d="M6 10h9.5a3.5 3.5 0 0 1 0 7H7a4 4 0 0 1-4-4v-1a2 2 0 0 1 2-2h1Z" />
        <path d="M17 10l2-3" />
        <path d="M19 10l2-3" />
        <path d="M7 17v2" />
        <path d="M15 17v2" />
        <path d="M6 10V8" />
      </svg>
    )
  }

  if (icon === "seeds") {
    return (
      <svg {...iconProps}>
        <path d="M12 20V9" />
        <path d="M12 12c-3 0-5-2-5-5 3 0 5 2 5 5Z" />
        <path d="M12 15c3 0 5-2 5-5-3 0-5 2-5 5Z" />
        <path d="M7 20h10" />
      </svg>
    )
  }

  if (icon === "fertilizer") {
    return (
      <svg {...iconProps}>
        <path d="M7 7h10l2 12H5L7 7Z" />
        <path d="M9 7V4h6v3" />
        <path d="M9 13h6" />
        <path d="M12 10v6" />
      </svg>
    )
  }

  if (icon === "equipment") {
    return (
      <svg {...iconProps}>
        <path d="M4 16h11l2-5h3v5" />
        <path d="M6 16a3 3 0 1 0 6 0" />
        <path d="M16 16a2 2 0 1 0 4 0" />
        <path d="M7 11h5l1 5" />
      </svg>
    )
  }

  if (icon === "tools") {
    return (
      <svg {...iconProps}>
        <path d="M14 6l4 4" />
        <path d="M4 20l7.5-7.5" />
        <path d="M12 5l7 7-2 2-7-7 2-2Z" />
        <path d="M6 18l-2 2" />
      </svg>
    )
  }

  return (
    <svg {...iconProps}>
      <path d="M5 18c5-1 9-5 11-10" />
      <path d="M9 18h8" />
      <path d="M15 8h4v4" />
      <path d="M4 14l3 3" />
    </svg>
  )
}

export default StoreTemplate
