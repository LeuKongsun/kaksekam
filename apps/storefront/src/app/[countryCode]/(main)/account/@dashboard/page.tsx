import { Metadata } from "next"

import Overview from "@modules/account/components/overview"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { retrieveAccountSellerProfile } from "@lib/data/seller-profile"

export const metadata: Metadata = {
  title: "Marketplace workspace",
  description: "Overview of your marketplace activity.",
}

export default async function OverviewTemplate() {
  const [customer, seller] = await Promise.all([
    retrieveCustomer().catch(() => null),
    retrieveAccountSellerProfile(),
  ])

  if (!customer) {
    notFound()
  }

  return <Overview customer={customer} seller={seller} />
}
