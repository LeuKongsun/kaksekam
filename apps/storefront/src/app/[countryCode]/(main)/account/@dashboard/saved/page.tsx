import { retrieveCustomer } from "@lib/data/customer"
import { listSavedListings } from "@lib/data/saved-listings"
import SavedListings from "@modules/account/components/saved-listings"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Saved listings",
  description: "View your saved marketplace listings.",
}

const PAGE_SIZE = 10

export default async function SavedListingsPage(props: {
  searchParams: Promise<{
    page?: string
  }>
}) {
  const searchParams = await props.searchParams
  const customer = await retrieveCustomer()

  if (!customer) {
    notFound()
  }

  const savedListings = await listSavedListings().catch(() => [])
  const totalPages = Math.max(1, Math.ceil(savedListings.length / PAGE_SIZE))
  const requestedPage = Number(searchParams.page)
  const page =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, totalPages)
      : 1
  const pageStart = (page - 1) * PAGE_SIZE
  const paginatedSavedListings = savedListings.slice(
    pageStart,
    pageStart + PAGE_SIZE,
  )

  return (
    <SavedListings
      savedListings={paginatedSavedListings}
      totalSavedListings={savedListings.length}
      page={page}
      pageSize={PAGE_SIZE}
      totalPages={totalPages}
    />
  )
}
