"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import { SortOptions } from "./sort-products"

type RefinementListProps = {
  sortBy: SortOptions
  category?: string
  location?: string
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
    <div className="rounded-full border border-gray-200 bg-white p-2 shadow-[0_8px_28px_rgba(15,23,42,0.10)]">
      <div className="grid gap-2 small:grid-cols-[1.2fr_1fr_1fr_1fr_auto] small:items-center">
        <label className="px-5 py-2">
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
        <label className="px-5 py-2">
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
        <label className="border-gray-200 px-5 py-2 small:border-l">
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
        <label className="border-gray-200 px-5 py-2 small:border-l">
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
          className="h-12 rounded-full bg-[#ff385c] px-6 text-small-semi text-white transition-colors hover:bg-[#e83152]"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

export default RefinementList
