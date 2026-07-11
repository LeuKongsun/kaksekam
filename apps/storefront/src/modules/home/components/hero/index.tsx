import {
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
  LISTING_LOCATIONS,
} from "@lib/marketplace/listing-fields"
import type { ListingCategory } from "@lib/marketplace/listing-fields"
import type { HomeTranslations, StoreTranslations } from "@lib/i18n/translations"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type HeroProps = {
  countryCode: string
  labels: HomeTranslations
  storeLabels: StoreTranslations
}

const selectClassName =
  "mt-1 w-full cursor-pointer bg-transparent text-small-regular text-ui-fg-base outline-none"

const Hero = ({ countryCode, labels, storeLabels }: HeroProps) => {
  return (
    <section className="border-b border-ui-border-base bg-white">
      <div className="content-container py-8 small:py-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <h1 className="text-3xl-semi leading-tight text-ui-fg-base small:text-[44px] small:leading-[52px]">
            {labels.titleBefore}
            <span className="text-brand">{labels.titleHighlight}</span>
            {labels.titleAfter}
          </h1>
          <p className="mt-3 max-w-2xl text-base-regular leading-7 text-ui-fg-subtle">
            {labels.subtitle}
          </p>

          <form
            action={`/${countryCode}`}
            className="mt-7 w-full overflow-hidden rounded-[8px] border border-gray-200 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.10)]"
          >
            <div className="grid divide-y divide-gray-200 text-left small:grid-cols-[1fr_1fr_1fr_1fr_auto] small:divide-x small:divide-y-0">
              <label className="px-4 py-3">
                <span className="block text-xsmall-semi text-ui-fg-base">
                  {storeLabels.allCategories}
                </span>
                <select name="category" className={selectClassName}>
                  <option value="">{storeLabels.allCategories}</option>
                  {LISTING_CATEGORIES.map((option) => (
                    <option key={option} value={option}>
                      {storeLabels.categories[option]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="px-4 py-3">
                <span className="block text-xsmall-semi text-ui-fg-base">
                  {storeLabels.location}
                </span>
                <select name="location" className={selectClassName}>
                  <option value="">{storeLabels.location}</option>
                  {LISTING_LOCATIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="px-4 py-3">
                <span className="block text-xsmall-semi text-ui-fg-base">
                  {storeLabels.condition}
                </span>
                <select name="condition" className={selectClassName}>
                  <option value="">{storeLabels.conditionOptions.any}</option>
                  {LISTING_CONDITIONS.map((option) => (
                    <option key={option} value={option}>
                      {
                        storeLabels.conditionOptions[
                          option as keyof typeof storeLabels.conditionOptions
                        ]
                      }
                    </option>
                  ))}
                </select>
              </label>

              <label className="px-4 py-3">
                <span className="block text-xsmall-semi text-ui-fg-base">
                  {storeLabels.sort}
                </span>
                <select name="sortBy" className={selectClassName}>
                  <option value="created_at">
                    {storeLabels.sortOptions.created_at}
                  </option>
                  <option value="price_asc">
                    {storeLabels.sortOptions.price_asc}
                  </option>
                  <option value="price_desc">
                    {storeLabels.sortOptions.price_desc}
                  </option>
                </select>
              </label>

              <button type="submit" className="brand-search-button w-full">
                {storeLabels.applyFilters}
              </button>
            </div>
          </form>

          <nav
            aria-label={storeLabels.allCategories}
            className="mt-5 w-full overflow-x-auto"
          >
            <ul className="flex min-w-max items-center justify-center gap-2 px-1 small:min-w-0 small:flex-wrap">
              {LISTING_CATEGORIES.map((category) => (
                <CategoryLink
                  key={category}
                  category={category}
                  label={storeLabels.categories[category]}
                />
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  )
}

const categoryThemes: Record<
  ListingCategory,
  { icon: string; surface: string; border: string; hoverBorder: string }
> = {
  Produce: {
    icon: "text-emerald-700",
    surface: "bg-emerald-50",
    border: "border-emerald-100",
    hoverBorder: "group-hover:border-emerald-300",
  },
  Livestock: {
    icon: "text-amber-700",
    surface: "bg-amber-50",
    border: "border-amber-100",
    hoverBorder: "group-hover:border-amber-300",
  },
  Seeds: {
    icon: "text-lime-700",
    surface: "bg-lime-50",
    border: "border-lime-100",
    hoverBorder: "group-hover:border-lime-300",
  },
  Fertilizer: {
    icon: "text-teal-700",
    surface: "bg-teal-50",
    border: "border-teal-100",
    hoverBorder: "group-hover:border-teal-300",
  },
  Equipment: {
    icon: "text-slate-700",
    surface: "bg-slate-100",
    border: "border-slate-200",
    hoverBorder: "group-hover:border-slate-400",
  },
  Tools: {
    icon: "text-orange-700",
    surface: "bg-orange-50",
    border: "border-orange-100",
    hoverBorder: "group-hover:border-orange-300",
  },
  Services: {
    icon: "text-sky-700",
    surface: "bg-sky-50",
    border: "border-sky-100",
    hoverBorder: "group-hover:border-sky-300",
  },
  Other: {
    icon: "text-stone-700",
    surface: "bg-stone-100",
    border: "border-stone-200",
    hoverBorder: "group-hover:border-stone-400",
  },
}

const CategoryLink = ({
  category,
  label,
}: {
  category: ListingCategory
  label: string
}) => {
  const theme = categoryThemes[category]

  return (
    <li>
      <LocalizedClientLink
        href={`/?category=${encodeURIComponent(category)}`}
        className="group flex min-w-[86px] flex-col items-center gap-2 rounded-[8px] border border-transparent px-3 py-2 text-center transition-colors hover:border-ui-border-base hover:bg-ui-bg-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-fg-interactive"
      >
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-[0_3px_10px_rgba(15,23,42,0.06)] transition-colors ${theme.surface} ${theme.border} ${theme.icon} ${theme.hoverBorder}`}
        >
          <CategoryIcon category={category} />
        </span>
        <span className="text-xsmall-semi text-ui-fg-base">{label}</span>
      </LocalizedClientLink>
    </li>
  )
}

const CategoryIcon = ({ category }: { category: ListingCategory }) => {
  const className = "h-5 w-5"

  switch (category) {
    case "Produce":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path
            d="M12 19c-4 0-7-2.7-7-6.2 0-2.6 1.8-5 4.4-5.8.7-1.4 1.8-2.4 3.3-3 0 1.3-.2 2.5-.8 3.5 3.9.1 7.1 2.8 7.1 6.1C19 16.6 16 19 12 19Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M12.6 7.4c1.4-1 3.1-1.4 5.1-1.1-.8 1.8-2.4 2.8-4.8 3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case "Livestock":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path
            d="M6.5 11.5c0-2.8 2.3-5 5.5-5s5.5 2.2 5.5 5v2.8c0 2.7-2.3 4.7-5.5 4.7s-5.5-2-5.5-4.7v-2.8Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M7 8.7 4.4 6.9M17 8.7l2.6-1.8M9.4 13.2h.1M14.5 13.2h.1M10 16h4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      )
    case "Seeds":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path
            d="M12 20V9M12 13.5c-3.5 0-5.7-2-6.4-5.8 3.9-.4 6.1 1.4 6.4 5.8ZM12 11.5c.4-3.5 2.5-5.2 6.4-4.8-.7 3.6-2.9 5.2-6.4 4.8Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case "Fertilizer":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path
            d="M7.5 8h9l1.4 10.2c.1 1-.6 1.8-1.6 1.8H7.7c-1 0-1.7-.8-1.6-1.8L7.5 8ZM9 8V5.5h6V8M9.2 13h5.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case "Equipment":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path
            d="M4 15.5h3.2l1.6-5h4.8l2.1 5H20M8 18.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 18.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM11 10.5V7h3.5l2.5 3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case "Tools":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path
            d="m5 19 6.8-6.8M14 4.8l5.2 5.2M13.4 5.4l-2.2 4.8 2.6 2.6 4.8-2.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case "Services":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path
            d="M7 18.5V9.2l5-3.7 5 3.7v9.3M9.5 18.5v-4.8h5v4.8M5 20h14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case "Other":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path
            d="M5.5 8.5h13M5.5 15.5h13M8.5 5.5v13M15.5 5.5v13"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      )
  }
}

export default Hero
