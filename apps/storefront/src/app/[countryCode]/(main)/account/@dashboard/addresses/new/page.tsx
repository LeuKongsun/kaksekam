import { retrieveCustomer } from "@lib/data/customer"
import { getRegion } from "@lib/data/regions"
import AddAddress from "@modules/account/components/address-card/add-address"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Add address",
  description: "Add a marketplace contact address.",
}

export default async function NewAddressPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const customer = await retrieveCustomer()
  const region = await getRegion(params.countryCode)

  if (!customer || !region) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="new-address-page-wrapper">
      <div className="mb-8 grid grid-cols-1 gap-4 small:grid-cols-[1fr_auto]">
        <div>
          <h1 className="text-2xl-semi">Add address</h1>
          <p className="mt-2 max-w-2xl text-base-regular text-ui-fg-subtle">
            Save a contact address for pickup, delivery, or marketplace seller
            coordination.
          </p>
        </div>
        <LocalizedClientLink
          href="/account/addresses"
          className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 px-4 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base"
        >
          Back to addresses
        </LocalizedClientLink>
      </div>

      <AddAddress region={region} />
    </div>
  )
}
