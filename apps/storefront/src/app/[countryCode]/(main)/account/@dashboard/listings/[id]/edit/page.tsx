import { retrieveCustomer } from "@lib/data/customer"
import { listSellerListings } from "@lib/data/seller-listings"
import SellerListingEditor from "@modules/account/components/seller-listing-editor"
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
      <SellerListingEditor listing={listing} />
    </div>
  )
}
