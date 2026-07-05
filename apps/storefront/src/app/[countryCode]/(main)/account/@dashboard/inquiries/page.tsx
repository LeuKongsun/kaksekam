import { retrieveCustomer } from "@lib/data/customer"
import {
  listBuyerInquiries,
  listSellerInquiries,
} from "@lib/data/listing-inquiries"
import InboxMessages from "@modules/account/components/inbox-messages"
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

  const [sellerInquiries, buyerInquiries] = await Promise.all([
    listSellerInquiries(),
    listBuyerInquiries(),
  ])

  return (
    <InboxMessages
      sellerInquiries={sellerInquiries}
      buyerInquiries={buyerInquiries}
    />
  )
}
