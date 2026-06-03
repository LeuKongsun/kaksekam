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
  'data-testid'?: string
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
  'data-testid': dataTestId,
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
    [searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`)
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white p-3 shadow-[0_8px_28px_rgba(15,23,42,0.08)]">
      <div className="grid gap-2 small:grid-cols-2 medium:grid-cols-[1.35fr_1fr_1fr_0.9fr_0.9fr_0.9fr_auto] medium:items-end">
        <label className="rounded-md border border-gray-200 px-3 py-2">
          <span className="block text-[11px] font-semibold text-ui-fg-base">
            Search
          </span>
          <input
            value={q ?? ""}
            onChange={(event) => setQueryParams("q", event.target.value)}
            placeholder="Rice, tractor, mango"
            className="mt-1 w-full bg-transparent text-small-regular text-ui-fg-subtle outline-none placeholder:text-ui-fg-muted"
          />
        </label>
        <label className="rounded-md border border-gray-200 px-3 py-2">
          <span className="block text-[11px] font-semibold text-ui-fg-base">
            What
          </span>
          <select
            value={category ?? ""}
            onChange={(event) => setQueryParams("category", event.target.value)}
            className="mt-1 w-full bg-transparent text-small-regular text-ui-fg-subtle outline-none"
          >
            <option value="">All categories</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="rounded-md border border-gray-200 px-3 py-2">
          <span className="block text-[11px] font-semibold text-ui-fg-base">
            Where
          </span>
          <input
            value={location ?? ""}
            onChange={(event) => setQueryParams("location", event.target.value)}
            placeholder="Province, district, farm"
            className="mt-1 w-full bg-transparent text-small-regular text-ui-fg-subtle outline-none placeholder:text-ui-fg-muted"
          />
        </label>
        <label className="rounded-md border border-gray-200 px-3 py-2">
          <span className="block text-[11px] font-semibold text-ui-fg-base">
            Availability
          </span>
          <select
            value={availability ?? ""}
            onChange={(event) =>
              setQueryParams("availability", event.target.value)
            }
            className="mt-1 w-full bg-transparent text-small-regular text-ui-fg-subtle outline-none"
          >
            <option value="">Any time</option>
            <option value="Ready now">Ready now</option>
            <option value="This week">This week</option>
            <option value="This month">This month</option>
            <option value="Pre-order">Pre-order</option>
          </select>
        </label>
        <label className="rounded-md border border-gray-200 px-3 py-2">
          <span className="block text-[11px] font-semibold text-ui-fg-base">
            Condition
          </span>
          <select
            value={condition ?? ""}
            onChange={(event) =>
              setQueryParams("condition", event.target.value)
            }
            className="mt-1 w-full bg-transparent text-small-regular text-ui-fg-subtle outline-none"
          >
            <option value="">Any condition</option>
            <option value="New">New</option>
            <option value="Used">Used</option>
            <option value="Fresh">Fresh</option>
            <option value="Organic">Organic</option>
            <option value="Conventional">Conventional</option>
          </select>
        </label>
        <label className="rounded-md border border-gray-200 px-3 py-2">
          <span className="block text-[11px] font-semibold text-ui-fg-base">
            Sort
          </span>
          <select
            value={sortBy}
            onChange={(event) =>
              setQueryParams("sortBy", event.target.value as SortOptions)
            }
            className="mt-1 w-full bg-transparent text-small-regular text-ui-fg-subtle outline-none"
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
          className="h-12 rounded-md bg-ui-fg-base px-5 text-small-semi text-white transition-colors hover:bg-ui-fg-subtle"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

export default RefinementList
