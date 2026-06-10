import { retrieveCustomer } from "@lib/data/customer"
import { listSavedListings } from "@lib/data/saved-listings"
import { listSavedSearches } from "@lib/data/saved-searches"
import SavedListings from "@modules/account/components/saved-listings"
import SavedSearches from "@modules/account/components/saved-searches"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Saved listings",
  description: "View your saved classifieds listings.",
}

const PAGE_SIZE = 10

export default async function SavedListingsPage(props: {
  searchParams: Promise<{
    page?: string
  }>
}) {
  const searchParams = await props.searchParams
  const customer = await retrieveCustomer()

  if (!customer) {
    notFound()
  }

  const [savedListings, savedSearches] = await Promise.all([
    listSavedListings(),
    listSavedSearches(),
  ])
  const savedSearchMatches = savedSearches.reduce(
    (total, search) => total + (search.match_count ?? 0),
    0
  )
  const totalPages = Math.max(1, Math.ceil(savedListings.length / PAGE_SIZE))
  const requestedPage = Number(searchParams.page)
  const page =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, totalPages)
      : 1
  const pageStart = (page - 1) * PAGE_SIZE
  const paginatedSavedListings = savedListings.slice(
    pageStart,
    pageStart + PAGE_SIZE
  )

  return (
    <div className="flex flex-col gap-y-10">
      <div>
        <h1 className="text-2xl-semi">Saved marketplace activity</h1>
        <p className="mt-2 max-w-2xl text-base-regular text-ui-fg-subtle">
          Revisit listings, rerun useful searches, and keep track of sellers you
          may want to contact.
        </p>
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-y border-gray-200 py-3">
          <SavedSignal label="Saved listings" value={savedListings.length} />
          <SavedSignal label="Saved searches" value={savedSearches.length} />
          <SavedSignal label="Current matches" value={savedSearchMatches} />
        </div>
      </div>
      <div>
        <div className="mb-4 flex flex-col gap-y-2">
          <h1 className="text-2xl-semi">Saved searches</h1>
          <p className="text-base-regular text-ui-fg-subtle">
            Revisit useful listing filters. Alerts can build on these later.
          </p>
        </div>
        <SavedSearches savedSearches={savedSearches} />
      </div>
      <SavedListings
        savedListings={paginatedSavedListings}
        totalSavedListings={savedListings.length}
        page={page}
        pageSize={PAGE_SIZE}
        totalPages={totalPages}
      />
    </div>
  )
}

const SavedSignal = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-baseline gap-x-2">
    <span className="text-[11px] font-medium uppercase text-ui-fg-subtle">
      {label}
    </span>
    <span className="text-base-semi text-ui-fg-base">{value}</span>
  </div>
)
