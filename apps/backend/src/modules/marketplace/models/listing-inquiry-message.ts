import { model } from "@medusajs/framework/utils"

const ListingInquiryMessage = model.define("listing_inquiry_message", {
  id: model.id().primaryKey(),
  inquiry_id: model.text(),
  sender_type: model.enum(["buyer", "seller"]),
  sender_id: model.text().nullable(),
  body: model.text(),
  read_at: model.text().nullable(),
})

export default ListingInquiryMessage
