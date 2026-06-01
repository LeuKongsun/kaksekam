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

  return (
    <div className="flex flex-col gap-y-10">
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
