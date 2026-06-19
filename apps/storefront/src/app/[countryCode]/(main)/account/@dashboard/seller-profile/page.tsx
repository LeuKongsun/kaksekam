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
      <SellerProfileForm customer={customer} seller={seller} />
    </div>
  )
}
