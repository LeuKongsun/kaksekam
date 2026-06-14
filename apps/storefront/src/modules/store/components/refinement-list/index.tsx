"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { FormEvent } from "react"
import { useEffect, useState } from "react"

import { StoreTranslations } from "@lib/i18n/translations"
import Modal from "@modules/common/components/modal"
import { SortOptions } from "./sort-products"

type RefinementListProps = {
  sortBy: SortOptions
  category?: string
  location?: string
  availability?: string
  condition?: string
  q?: string
  search?: boolean
  labels: StoreTranslations
  "data-testid"?: string
}

type CategoryOption = keyof StoreTranslations["categories"]

const categoryOptions: CategoryOption[] = [
  "Produce",
  "Livestock",
  "Seeds",
  "Fertilizer",
  "Equipment",
  "Tools",
  "Services",
  "Other",
]

const RefinementList = ({
  sortBy,
  category,
  location,
  availability,
  condition,
  q,
  labels,
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [draftCategory, setDraftCategory] = useState(category ?? "")
  const [draftLocation, setDraftLocation] = useState(location ?? "")
  const [draftSortBy, setDraftSortBy] = useState<SortOptions>(sortBy)
  const [draftAvailability, setDraftAvailability] = useState(availability ?? "")
  const [draftCondition, setDraftCondition] = useState(condition ?? "")
  const [draftQuery, setDraftQuery] = useState(q ?? "")

  useEffect(() => {
    setDraftQuery(q ?? "")
    setDraftCategory(category ?? "")
    setDraftLocation(location ?? "")
    setDraftSortBy(sortBy)
    setDraftAvailability(availability ?? "")
    setDraftCondition(condition ?? "")
  }, [availability, category, condition, location, q, sortBy])

  const hasFilters = Boolean(
    draftLocation ||
      draftAvailability ||
      draftCondition ||
      draftSortBy !== "created_at"
  )

  const openFilterDialog = () => {
    setIsFilterOpen(true)
  }

  const applyFilters = () => {
    setIsFilterOpen(false)
  }

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const params = new URLSearchParams(searchParams)
    const filters = [
      ["q", draftQuery.trim()],
      ["category", draftCategory],
      ["location", draftLocation],
      ["sortBy", draftSortBy === "created_at" ? "" : draftSortBy],
      ["availability", draftAvailability],
      ["condition", draftCondition],
    ]

    filters.forEach(([name, value]) => {
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
    })
    params.delete("page")

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <div className="border-y border-gray-200 bg-white py-3">
      <form
        onSubmit={submitSearch}
        className="grid grid-cols-[minmax(0,1fr)_minmax(132px,180px)_36px_36px] items-center gap-2 small:grid-cols-[minmax(220px,1fr)_240px_auto_auto]"
      >
        <label className="block min-w-0 flex-1">
          <span className="sr-only">{labels.searchListings}</span>
          <input
            type="search"
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder={labels.searchPlaceholder}
            className="h-9 w-full rounded-full border border-gray-200 bg-gray-50 px-3 text-small-regular text-ui-fg-base outline-none placeholder:text-ui-fg-muted transition-colors hover:border-gray-300 focus:border-ui-fg-base"
          />
        </label>
        <label className="block min-w-0">
          <select
            value={draftCategory}
            onChange={(event) => setDraftCategory(event.target.value)}
            className="h-9 w-full rounded-full border border-gray-200 bg-white px-3 text-small-regular text-ui-fg-base outline-none transition-colors hover:border-gray-300 focus:border-ui-fg-base"
          >
            <option value="">{labels.allCategories}</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {labels.categories[option]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={openFilterDialog}
          aria-label={labels.filters}
          className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
            hasFilters
              ? "border-ui-fg-base bg-ui-fg-base text-white"
              : "border-gray-200 text-ui-fg-subtle hover:border-gray-300 hover:text-ui-fg-base"
          }`}
        >
          <FilterIcon />
        </button>
        <button
          type="submit"
          aria-label={labels.searchListings}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ui-fg-base text-white transition-colors hover:bg-ui-fg-subtle"
        >
          <SearchIcon />
        </button>
      </form>

      <Modal
        isOpen={isFilterOpen}
        close={() => setIsFilterOpen(false)}
        size="small"
        data-testid="listing-filter-modal"
      >
        <Modal.Title>{labels.filters}</Modal.Title>
        <div className="grid gap-3 py-5">
          <label className="block">
            <span className="mb-1.5 block text-small-semi text-ui-fg-base">
              {labels.location}
            </span>
            <input
              value={draftLocation}
              onChange={(event) => setDraftLocation(event.target.value)}
              placeholder={labels.location}
              className="h-10 w-full rounded-full border border-gray-200 bg-white px-3 text-small-regular text-ui-fg-base outline-none placeholder:text-ui-fg-muted transition-colors hover:border-gray-300 focus:border-ui-fg-base"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-small-semi text-ui-fg-base">
              {labels.sort}
            </span>
            <select
              value={draftSortBy}
              onChange={(event) =>
                setDraftSortBy(event.target.value as SortOptions)
              }
              className="h-10 w-full rounded-full border border-gray-200 bg-white px-3 text-small-regular text-ui-fg-base outline-none transition-colors hover:border-gray-300 focus:border-ui-fg-base"
              data-testid={dataTestId}
            >
              <option value="created_at">
                {labels.sortOptions.created_at}
              </option>
              <option value="price_asc">{labels.sortOptions.price_asc}</option>
              <option value="price_desc">
                {labels.sortOptions.price_desc}
              </option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-small-semi text-ui-fg-base">
              {labels.availability}
            </span>
            <select
              value={draftAvailability}
              onChange={(event) => setDraftAvailability(event.target.value)}
              className="h-10 w-full rounded-full border border-gray-200 bg-white px-3 text-small-regular text-ui-fg-base outline-none transition-colors hover:border-gray-300 focus:border-ui-fg-base"
            >
              <option value="">{labels.availabilityOptions.any}</option>
              <option value="Ready now">
                {labels.availabilityOptions["Ready now"]}
              </option>
              <option value="This week">
                {labels.availabilityOptions["This week"]}
              </option>
              <option value="This month">
                {labels.availabilityOptions["This month"]}
              </option>
              <option value="Pre-order">
                {labels.availabilityOptions["Pre-order"]}
              </option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-small-semi text-ui-fg-base">
              {labels.condition}
            </span>
            <select
              value={draftCondition}
              onChange={(event) => setDraftCondition(event.target.value)}
              className="h-10 w-full rounded-full border border-gray-200 bg-white px-3 text-small-regular text-ui-fg-base outline-none transition-colors hover:border-gray-300 focus:border-ui-fg-base"
            >
              <option value="">{labels.conditionOptions.any}</option>
              <option value="New">{labels.conditionOptions.New}</option>
              <option value="Used">{labels.conditionOptions.Used}</option>
              <option value="Fresh">{labels.conditionOptions.Fresh}</option>
              <option value="Organic">{labels.conditionOptions.Organic}</option>
              <option value="Conventional">
                {labels.conditionOptions.Conventional}
              </option>
            </select>
          </label>
        </div>
        <Modal.Footer>
          <button
            type="button"
            onClick={applyFilters}
            className="h-9 rounded-full bg-ui-fg-base px-5 text-small-semi text-white transition-colors hover:bg-ui-fg-subtle"
          >
            {labels.ok}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

const FilterIcon = () => (
  <svg
    aria-hidden="true"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.8"
    viewBox="0 0 24 24"
  >
    <path d="M4 6h16" />
    <path d="M7 12h10" />
    <path d="M10 18h4" />
  </svg>
)

const SearchIcon = () => (
  <svg
    aria-hidden="true"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.8"
    viewBox="0 0 24 24"
  >
    <circle cx="11" cy="11" r="6" />
    <path d="m16 16 4 4" />
  </svg>
)

export default RefinementList
