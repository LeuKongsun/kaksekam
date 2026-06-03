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

export default async function SavedListingsPage() {
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

  return (
    <div className="flex flex-col gap-y-10">
      <div>
        <h1 className="text-2xl-semi">Saved marketplace activity</h1>
        <p className="mt-2 max-w-2xl text-base-regular text-ui-fg-subtle">
          Revisit listings, rerun useful searches, and keep track of sellers you
          may want to contact.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 small:grid-cols-3">
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
      <SavedListings savedListings={savedListings} />
    </div>
  )
}

const SavedSignal = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-md border border-gray-200 bg-white p-4">
    <div className="text-[11px] font-medium uppercase text-ui-fg-subtle">
      {label}
    </div>
    <div className="mt-1 text-xl-semi text-ui-fg-base">{value}</div>
  </div>
)
