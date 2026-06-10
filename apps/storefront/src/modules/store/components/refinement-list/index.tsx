"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import { SortOptions } from "./sort-products"

type RefinementListProps = {
  sortBy: SortOptions
  category?: string
  location?: string
  availability?: string
  condition?: string
  q?: string
  search?: boolean
  "data-testid"?: string
}

const categoryOptions = [
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
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      params.delete("page")

      return params.toString()
    },
    [searchParams],
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`)
  }

  const hasAdvancedFilters = Boolean(availability || condition)

  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.06)]">
      <div className="grid gap-3 small:grid-cols-2 medium:grid-cols-[1.5fr_1fr_1fr_0.9fr_auto] medium:items-end">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase text-ui-fg-subtle">
            Search
          </span>
          <input
            value={q ?? ""}
            onChange={(event) => setQueryParams("q", event.target.value)}
            placeholder="Rice, tractor, mango"
            className="h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-small-regular text-ui-fg-base outline-none placeholder:text-ui-fg-muted transition-colors hover:border-gray-300 focus:border-ui-fg-base"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase text-ui-fg-subtle">
            Category
          </span>
          <select
            value={category ?? ""}
            onChange={(event) => setQueryParams("category", event.target.value)}
            className="h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-small-regular text-ui-fg-base outline-none transition-colors hover:border-gray-300 focus:border-ui-fg-base"
          >
            <option value="">All categories</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase text-ui-fg-subtle">
            Location
          </span>
          <input
            value={location ?? ""}
            onChange={(event) => setQueryParams("location", event.target.value)}
            placeholder="Province, district, farm"
            className="h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-small-regular text-ui-fg-base outline-none placeholder:text-ui-fg-muted transition-colors hover:border-gray-300 focus:border-ui-fg-base"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase text-ui-fg-subtle">
            Sort
          </span>
          <select
            value={sortBy}
            onChange={(event) =>
              setQueryParams("sortBy", event.target.value as SortOptions)
            }
            className="h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-small-regular text-ui-fg-base outline-none transition-colors hover:border-gray-300 focus:border-ui-fg-base"
            data-testid={dataTestId}
          >
            <option value="created_at">Latest</option>
            <option value="price_asc">Price low to high</option>
            <option value="price_desc">Price high to low</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            router.push(pathname)
          }}
          className="h-11 rounded-md bg-ui-fg-base px-5 text-small-semi text-white transition-colors hover:bg-ui-fg-subtle"
        >
          Clear
        </button>
      </div>
      <details className="mt-3" open={hasAdvancedFilters}>
        <summary className="cursor-pointer list-none px-1 py-2 text-small-semi text-ui-fg-subtle transition-colors hover:text-ui-fg-base">
          More filters
        </summary>
        <div className="grid gap-3 pt-1 small:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase text-ui-fg-subtle">
              Availability
            </span>
            <select
              value={availability ?? ""}
              onChange={(event) =>
                setQueryParams("availability", event.target.value)
              }
              className="h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-small-regular text-ui-fg-base outline-none transition-colors hover:border-gray-300 focus:border-ui-fg-base"
            >
              <option value="">Any time</option>
              <option value="Ready now">Ready now</option>
              <option value="This week">This week</option>
              <option value="This month">This month</option>
              <option value="Pre-order">Pre-order</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase text-ui-fg-subtle">
              Condition
            </span>
            <select
              value={condition ?? ""}
              onChange={(event) =>
                setQueryParams("condition", event.target.value)
              }
              className="h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-small-regular text-ui-fg-base outline-none transition-colors hover:border-gray-300 focus:border-ui-fg-base"
            >
              <option value="">Any condition</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
              <option value="Fresh">Fresh</option>
              <option value="Organic">Organic</option>
              <option value="Conventional">Conventional</option>
            </select>
          </label>
        </div>
      </details>
    </div>
  )
}

export default RefinementList
