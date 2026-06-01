import { retrieveCustomer } from "@lib/data/customer"
import { listSellerInquiries } from "@lib/data/listing-inquiries"
import SellerInquiries from "@modules/account/components/seller-inquiries"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Inquiries",
  description: "Review buyer messages for your farming listings.",
}

export default async function InquiriesPage() {
  const customer = await retrieveCustomer()

  if (!customer) {
    notFound()
  }

  const inquiries = await listSellerInquiries()

  return <SellerInquiries inquiries={inquiries} />
}
