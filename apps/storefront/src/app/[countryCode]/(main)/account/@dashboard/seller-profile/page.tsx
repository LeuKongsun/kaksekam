import { retrieveCustomer } from "@lib/data/customer"
import { getRegion } from "@lib/data/regions"
import { retrieveAccountSellerProfile } from "@lib/data/seller-profile"
import AddressBook from "@modules/account/components/address-book"
import SellerProfileForm from "@modules/account/components/seller-profile-form"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Personal info",
  description: "Manage your seller and account information.",
}

export default async function SellerProfilePage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const [customer, seller, region] = await Promise.all([
    retrieveCustomer(),
    retrieveAccountSellerProfile(),
    getRegion(params.countryCode),
  ])

  if (!customer || !region) {
    notFound()
  }

  return (
    <div
      className="grid w-full gap-5"
      data-testid="seller-profile-page-wrapper"
    >
      <div>
        <h1 className="text-xl-semi text-ui-fg-base">Personal info</h1>
        <p className="mt-1 text-small-regular text-ui-fg-subtle">
          Manage what buyers see and the contact details connected to your
          account.
        </p>
      </div>
      <SellerProfileForm customer={customer} seller={seller} />
      <section className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
        <AddressBook customer={customer} region={region} />
      </section>
    </div>
  )
}
