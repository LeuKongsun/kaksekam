import { listSellerListings } from "@lib/data/seller-listings"
import { retrieveCustomer } from "@lib/data/customer"
import SellerListings from "@modules/account/components/seller-listings"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Listings",
  description: "Create and manage your classifieds listings.",
}

export default async function ListingsPage() {
  const customer = await retrieveCustomer()

  if (!customer) {
    notFound()
  }

  const listings = await listSellerListings().catch(() => [])

  return <SellerListings listings={listings} />
}
