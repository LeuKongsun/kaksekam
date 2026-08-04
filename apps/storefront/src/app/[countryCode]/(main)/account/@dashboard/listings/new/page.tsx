import { retrieveCustomer } from "@lib/data/customer"
import SellerListingForm from "@modules/account/components/seller-listing-form"
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
      <SellerListingForm />
    </div>
  )
}
