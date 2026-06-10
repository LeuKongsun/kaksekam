import { retrieveCustomer } from "@lib/data/customer"
import SellerListingForm from "@modules/account/components/seller-listing-form"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Add listing",
  description: "Create a new marketplace listing.",
}

export default async function NewListingPage() {
  const customer = await retrieveCustomer()

  if (!customer) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="new-listing-page-wrapper">
      <div className="mb-8 grid grid-cols-1 gap-4 small:grid-cols-[1fr_auto]">
        <div>
          <h1 className="text-2xl-semi">Add listing</h1>
          <p className="mt-2 max-w-2xl text-base-regular text-ui-fg-subtle">
            Create a marketplace listing and submit it for admin review.
          </p>
        </div>
        <LocalizedClientLink
          href="/account/listings"
          className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 px-4 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base"
        >
          Back to listings
        </LocalizedClientLink>
      </div>

      <SellerListingForm />
    </div>
  )
}
