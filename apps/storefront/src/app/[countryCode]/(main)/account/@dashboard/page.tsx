import { Metadata } from "next"

import Overview from "@modules/account/components/overview"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { retrieveAccountSellerProfile } from "@lib/data/seller-profile"
import {
  listBuyerInquiries,
  listSellerInquiries,
} from "@lib/data/listing-inquiries"
import { listSavedListings } from "@lib/data/saved-listings"
import { listSavedSearches } from "@lib/data/saved-searches"
import { listSellerListings } from "@lib/data/seller-listings"

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

  const [
    listings,
    sellerInquiries,
    buyerInquiries,
    savedListings,
    savedSearches,
  ] = await Promise.all([
    listSellerListings().catch(() => []),
    listSellerInquiries().catch(() => []),
    listBuyerInquiries().catch(() => []),
    listSavedListings().catch(() => []),
    listSavedSearches().catch(() => []),
  ])

  return (
    <Overview
      customer={customer}
      seller={seller}
      metrics={{
        listings: listings.length,
        activeListings: listings.filter(
          (listing) => listing.status === "active"
        ).length,
        pendingListings: listings.filter(
          (listing) => listing.status === "pending_review"
        ).length,
        sellerInquiries: sellerInquiries.filter(
          (inquiry) => inquiry.status !== "archived"
        ).length,
        newSellerInquiries: sellerInquiries.filter(
          (inquiry) => inquiry.status === "new"
        ).length,
        buyerInquiries: buyerInquiries.length,
        savedListings: savedListings.length,
        savedSearches: savedSearches.length,
      }}
    />
  )
}
