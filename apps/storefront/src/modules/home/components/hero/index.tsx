import {
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
  LISTING_LOCATIONS,
} from "@lib/marketplace/listing-fields"
import type { HomeTranslations, StoreTranslations } from "@lib/i18n/translations"

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
            {labels.title}
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
        </div>
      </div>
    </section>
  )
}

export default Hero
