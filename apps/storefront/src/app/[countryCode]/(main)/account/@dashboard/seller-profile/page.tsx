import { retrieveCustomer } from "@lib/data/customer"
import { retrieveAccountSellerProfile } from "@lib/data/seller-profile"
import SellerProfileForm from "@modules/account/components/seller-profile-form"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Seller profile",
  description: "Manage your farm or business profile.",
}

export default async function SellerProfilePage() {
  const [customer, seller] = await Promise.all([
    retrieveCustomer(),
    retrieveAccountSellerProfile(),
  ])

  if (!customer) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="seller-profile-page-wrapper">
      <div className="mb-8 rounded-md border border-gray-200 bg-white p-5">
        <h1 className="text-2xl-semi">Seller profile</h1>
        <p className="mt-2 max-w-2xl text-base-regular text-ui-fg-subtle">
          Manage the farm or business details shown on listings and public
          seller pages.
        </p>
      </div>

      <SellerProfileForm customer={customer} seller={seller} />
    </div>
  )
}
