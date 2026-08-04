"use client"

import {
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
  LISTING_LOCATIONS,
} from "@lib/marketplace/listing-fields"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { StoreTranslations } from "@lib/i18n/translations"
import Modal from "@modules/common/components/modal"
import { SortOptions } from "./sort-products"

type RefinementListProps = {
  sortBy: SortOptions
  category?: string
  location?: string
  condition?: string
  q?: string
  search?: boolean
  labels: StoreTranslations
  "data-testid"?: string
}

type CategoryOption = keyof StoreTranslations["categories"]

const fieldClassName =
  "mt-1 w-full bg-transparent text-small-regular text-ui-fg-base outline-none placeholder:text-ui-fg-muted"

const RefinementList = ({
  sortBy,
  category,
  location,
  condition,
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
  const [draftCondition, setDraftCondition] = useState(condition ?? "")

  useEffect(() => {
    setDraftCategory(category ?? "")
    setDraftLocation(location ?? "")
    setDraftSortBy(sortBy)
    setDraftCondition(condition ?? "")
  }, [category, condition, location, sortBy])

  const hasAdvancedFilters = Boolean(
    draftCategory ||
      draftCondition ||
      draftSortBy !== "created_at"
  )

  const activeFilters = useMemo(
    () =>
      [
        location && { key: "location", label: `${labels.where}: ${location}` },
        category && {
          key: "category",
          label: labels.categories[category as CategoryOption] ?? category,
        },
        condition && {
          key: "condition",
          label: `${labels.condition}: ${
            labels.conditionOptions[
              condition as keyof typeof labels.conditionOptions
            ] ?? condition
          }`,
        },
        sortBy !== "created_at" && {
          key: "sortBy",
          label: `${labels.sort}: ${
            labels.sortOptions[sortBy as keyof typeof labels.sortOptions]
          }`,
        },
      ].filter(Boolean) as Array<{ key: string; label: string }>,
    [
      category,
      condition,
      labels,
      location,
      sortBy,
    ]
  )

  const pushFilters = (nextValues?: {
    category?: string
    location?: string
    sortBy?: SortOptions
    condition?: string
  }) => {
    const params = new URLSearchParams(searchParams)
    const values = {
      category: nextValues?.category ?? draftCategory,
      location: nextValues?.location ?? draftLocation.trim(),
      sortBy: nextValues?.sortBy ?? draftSortBy,
      condition: nextValues?.condition ?? draftCondition,
    }

    const filters = [
      ["category", values.category],
      ["location", values.location],
      ["sortBy", values.sortBy === "created_at" ? "" : values.sortBy],
      ["condition", values.condition],
    ]

    filters.forEach(([name, value]) => {
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
    })
    params.delete("q")
    params.delete("page")

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  const applyFilters = () => {
    setIsFilterOpen(false)
    pushFilters()
  }

  const clearFilters = () => {
    setDraftCategory("")
    setDraftLocation("")
    setDraftSortBy("created_at")
    setDraftCondition("")
    setIsFilterOpen(false)
    router.push(pathname)
  }

  return (
    <div className="space-y-3">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          pushFilters()
        }}
        className="overflow-hidden rounded-[8px] border border-gray-200 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.08)]"
      >
        <div className="flex flex-col small:flex-row small:items-stretch">
          <div className="grid flex-1 divide-y divide-gray-200 small:grid-cols-1 small:divide-y-0">
            <label className="px-4 py-3 text-left">
              <span className="block text-xsmall-semi text-ui-fg-base">
                {labels.where}
              </span>
              <select
                value={draftLocation}
                onChange={(event) => setDraftLocation(event.target.value)}
                className={`${fieldClassName} cursor-pointer`}
              >
                <option value="">{labels.location}</option>
                {LISTING_LOCATIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex shrink-0 border-t border-gray-200 small:border-l small:border-t-0">
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              aria-label={labels.filters}
              className={`brand-filter-button ${
                hasAdvancedFilters ? "is-active" : ""
              }`}
            >
              <FilterIcon />
            </button>

            <button
              type="submit"
              className="brand-search-button"
              data-testid="store-search-button"
            >
              {labels.applyFilters}
            </button>
          </div>
        </div>
      </form>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xsmall-regular text-ui-fg-base"
            >
              {filter.label}
            </span>
          ))}
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-full px-3 py-1.5 text-xsmall-semi text-ui-fg-subtle transition-colors hover:text-ui-fg-base"
          >
            {labels.clearFilters}
          </button>
        </div>
      )}

      <Modal
        isOpen={isFilterOpen}
        close={() => setIsFilterOpen(false)}
        size="small"
        data-testid="listing-filter-modal"
      >
        <Modal.Title>{labels.filters}</Modal.Title>
        <div className="grid gap-4 py-5">
          <label className="block">
            <span className="mb-1.5 block text-small-semi text-ui-fg-base">
              {labels.allCategories}
            </span>
            <select
              value={draftCategory}
              onChange={(event) => setDraftCategory(event.target.value)}
              className="h-11 w-full cursor-pointer rounded-full border border-gray-200 bg-white px-4 text-small-regular text-ui-fg-base outline-none transition-colors hover:border-gray-300 focus:border-ui-fg-base"
            >
              <option value="">{labels.allCategories}</option>
              {LISTING_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {labels.categories[option]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-small-semi text-ui-fg-base">
              {labels.condition}
            </span>
            <select
              value={draftCondition}
              onChange={(event) => setDraftCondition(event.target.value)}
              className="h-11 w-full rounded-full border border-gray-200 bg-white px-4 text-small-regular text-ui-fg-base outline-none transition-colors hover:border-gray-300 focus:border-ui-fg-base"
            >
              <option value="">{labels.conditionOptions.any}</option>
              {LISTING_CONDITIONS.map((option) => (
                <option key={option} value={option}>
                  {
                    labels.conditionOptions[
                      option as keyof typeof labels.conditionOptions
                    ]
                  }
                </option>
              ))}
            </select>
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
              className="h-11 w-full rounded-full border border-gray-200 bg-white px-4 text-small-regular text-ui-fg-base outline-none transition-colors hover:border-gray-300 focus:border-ui-fg-base"
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
        </div>
        <Modal.Footer>
          <div className="flex w-full items-center justify-between gap-3">
            <button
              type="button"
              onClick={clearFilters}
              className="h-11 rounded-full px-4 text-small-semi text-ui-fg-subtle transition-colors hover:text-ui-fg-base"
            >
              {labels.clearFilters}
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="brand-search-button min-h-[2.75rem] rounded-full"
            >
              {labels.applyFilters}
            </button>
          </div>
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

export default RefinementList
