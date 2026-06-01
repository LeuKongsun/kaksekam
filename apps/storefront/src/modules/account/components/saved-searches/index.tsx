"use client"

import { removeSavedSearch, SavedSearch } from "@lib/data/saved-searches"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams, useRouter } from "next/navigation"
import { useState, useTransition } from "react"

type SavedSearchesProps = {
  savedSearches: SavedSearch[]
}

const getSearchHref = (search: SavedSearch) => {
  const params = new URLSearchParams()

  if (search.query) {
    params.set("q", search.query)
  }
  if (search.category) {
    params.set("category", search.category)
  }
  if (search.location) {
    params.set("location", search.location)
  }

  return `/store${params.toString() ? `?${params.toString()}` : ""}`
}

const SavedSearches = ({ savedSearches }: SavedSearchesProps) => {
  if (!savedSearches.length) {
    return (
      <div className="rounded-md border border-gray-200 p-4 text-base-regular text-ui-fg-subtle">
        No saved searches yet.
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200 rounded-md border border-gray-200">
      {savedSearches.map((search) => (
        <div
          key={search.id}
          className="grid grid-cols-1 gap-3 p-4 small:grid-cols-[1fr_auto]"
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <LocalizedClientLink
                href={getSearchHref(search)}
                className="text-base-semi hover:text-ui-fg-interactive"
              >
                {search.name}
              </LocalizedClientLink>
              <span className="rounded-full border border-gray-200 px-2 py-0.5 text-[11px] font-medium uppercase text-ui-fg-subtle">
                {search.match_count ?? 0} match
                {(search.match_count ?? 0) === 1 ? "" : "es"}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {search.query && <SearchChip label={`Search: ${search.query}`} />}
              {search.category && (
                <SearchChip label={`Category: ${search.category}`} />
              )}
              {search.location && (
                <SearchChip label={`Location: ${search.location}`} />
              )}
            </div>
            <p className="mt-2 text-small-regular text-ui-fg-subtle">
              Saved {new Date(search.created_at).toLocaleDateString()}
            </p>
          </div>
          <RemoveSavedSearchButton savedSearchId={search.id} />
        </div>
      ))}
    </div>
  )
}

const SearchChip = ({ label }: { label: string }) => (
  <span className="rounded-md bg-gray-100 px-2 py-1 text-small-regular text-ui-fg-subtle">
    {label}
  </span>
)

const RemoveSavedSearchButton = ({
  savedSearchId,
}: {
  savedSearchId: string
}) => {
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const remove = () => {
    setError(null)

    startTransition(async () => {
      const result = await removeSavedSearch(savedSearchId, countryCode)

      if (!result.success) {
        setError(result.error)
        return
      }

      router.refresh()
    })
  }

  return (
    <div className="small:text-right">
      <button
        type="button"
        disabled={isPending}
        onClick={remove}
        className="rounded-full border border-gray-300 px-3 py-1.5 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base disabled:opacity-50"
      >
        {isPending ? "Removing..." : "Remove"}
      </button>
      {error && <p className="mt-2 text-small-regular text-rose-600">{error}</p>}
    </div>
  )
}

export default SavedSearches
