import { Metadata } from "next"

import AccountProfilePanel from "@modules/account/components/account-profile-panel"
import { notFound } from "next/navigation"
import { listRegions } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Profile",
  description: "View and edit your marketplace account profile.",
}

export default async function Profile() {
  const customer = await retrieveCustomer()
  const regions = await listRegions()

  if (!customer || !regions) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="profile-page-wrapper">
      <AccountProfilePanel customer={customer} regions={regions} />
    </div>
  )
}
