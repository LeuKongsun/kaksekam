import { listSellerListings } from "@lib/data/seller-listings"
import { retrieveCustomer } from "@lib/data/customer"
import SellerListings from "@modules/account/components/seller-listings"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Listings",
  description: "Create and manage your classifieds listings.",
}

const PAGE_SIZE = 10

export default async function ListingsPage(props: {
  searchParams: Promise<{
    page?: string
  }>
}) {
  const searchParams = await props.searchParams
  const customer = await retrieveCustomer()

  if (!customer) {
    notFound()
  }

  const listings = await listSellerListings().catch(() => [])
  const statusCounts = listings.reduce(
    (counts, listing) => ({
      ...counts,
      [listing.status]: counts[listing.status] + 1,
    }),
    {
      draft: 0,
      pending_review: 0,
      active: 0,
      sold: 0,
      rejected: 0,
      expired: 0,
    },
  )
  const requestedPage = Number(searchParams.page)
  const page =
    Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1

  return (
    <SellerListings
      listings={listings}
      totalListings={listings.length}
      statusCounts={statusCounts}
      page={page}
      pageSize={PAGE_SIZE}
    />
  )
}
