import { retrieveCustomer } from "@lib/data/customer"
import { listSellerListings } from "@lib/data/seller-listings"
import SellerListingEditor from "@modules/account/components/seller-listing-editor"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Edit listing",
  description: "Edit a marketplace listing.",
}

export default async function EditListingPage(props: {
  params: Promise<{
    id: string
  }>
}) {
  const params = await props.params
  const customer = await retrieveCustomer()

  if (!customer) {
    notFound()
  }

  const listings = await listSellerListings().catch(() => [])
  const listing = listings.find((item) => item.id === params.id)

  if (!listing) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="edit-listing-page-wrapper">
      <div className="mb-8 grid grid-cols-1 gap-4 small:grid-cols-[1fr_auto]">
        <div>
          <h1 className="text-2xl-semi">Edit listing</h1>
          <p className="mt-2 max-w-2xl text-base-regular text-ui-fg-subtle">
            Update listing details and submit changes for admin review.
          </p>
        </div>
        <LocalizedClientLink
          href="/account/listings"
          className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 px-4 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base"
        >
          Back to listings
        </LocalizedClientLink>
      </div>

      <SellerListingEditor listing={listing} />
    </div>
  )
}
