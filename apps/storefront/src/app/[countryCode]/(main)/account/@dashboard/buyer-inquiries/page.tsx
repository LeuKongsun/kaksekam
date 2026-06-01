import { retrieveCustomer } from "@lib/data/customer"
import { listBuyerInquiries } from "@lib/data/listing-inquiries"
import BuyerInquiries from "@modules/account/components/buyer-inquiries"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Buyer inquiries",
  description: "Track messages you have sent to farmers.",
}

export default async function BuyerInquiriesPage() {
  const customer = await retrieveCustomer()

  if (!customer) {
    notFound()
  }

  const inquiries = await listBuyerInquiries()

  return <BuyerInquiries inquiries={inquiries} />
}
