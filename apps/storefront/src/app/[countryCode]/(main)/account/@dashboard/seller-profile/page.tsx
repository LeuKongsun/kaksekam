import { retrieveCustomer } from "@lib/data/customer"
import { retrieveAccountSellerProfile } from "@lib/data/seller-profile"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
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
      <div className="mb-8 grid grid-cols-1 gap-4 small:grid-cols-[1fr_auto]">
        <div>
          <h1 className="text-2xl-semi">Seller profile</h1>
          <p className="mt-2 max-w-2xl text-base-regular text-ui-fg-subtle">
            Manage the farm or business details buyers see before they inquire
            about your listings.
          </p>
        </div>
        {seller?.handle && (
          <LocalizedClientLink
            href={`/sellers/${seller.handle}`}
            className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 px-4 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base"
          >
            View public profile
          </LocalizedClientLink>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 small:grid-cols-3">
        <ProfileSignal
          label="Public name"
          value={seller?.display_name ?? "Not created"}
          ready={!!seller?.display_name}
        />
        <ProfileSignal
          label="Contact"
          value={seller?.email || seller?.phone ? "Available" : "Missing"}
          ready={!!(seller?.email || seller?.phone)}
        />
        <ProfileSignal
          label="Marketplace bio"
          value={seller?.bio ? "Added" : "Missing"}
          ready={!!seller?.bio}
        />
      </div>

      <SellerProfileForm customer={customer} seller={seller} />
    </div>
  )
}

const ProfileSignal = ({
  label,
  value,
  ready,
}: {
  label: string
  value: string
  ready: boolean
}) => (
  <div className="rounded-md border border-gray-200 bg-white p-4">
    <div className="text-[11px] font-medium uppercase text-ui-fg-subtle">
      {label}
    </div>
    <div className="mt-1 text-base-semi text-ui-fg-base">{value}</div>
    <div
      className={`mt-2 text-small-regular ${
        ready ? "text-green-700" : "text-amber-700"
      }`}
    >
      {ready ? "Ready for buyers" : "Add this before publishing"}
    </div>
  </div>
)
