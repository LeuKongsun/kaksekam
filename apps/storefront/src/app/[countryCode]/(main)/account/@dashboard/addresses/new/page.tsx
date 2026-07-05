import { retrieveCustomer } from "@lib/data/customer"
import { getRegion } from "@lib/data/regions"
import AddAddress from "@modules/account/components/address-card/add-address"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Add location",
  description: "Add a marketplace contact location.",
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
      <div className="mb-8">
        <div>
          <h1 className="text-2xl-semi">Add location</h1>
          <p className="mt-2 max-w-2xl text-base-regular text-ui-fg-subtle">
            Save a pickup place, farm location, or contact point.
          </p>
        </div>
      </div>

      <AddAddress region={region} />
    </div>
  )
}
