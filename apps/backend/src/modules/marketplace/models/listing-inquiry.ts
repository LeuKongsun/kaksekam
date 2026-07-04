import { model } from "@medusajs/framework/utils"

const ListingInquiry = model.define("listing_inquiry", {
  id: model.id().primaryKey(),
  listing_id: model.text(),
  product_id: model.text(),
  seller_id: model.text(),
  customer_id: model.text().nullable(),
  buyer_name: model.text(),
  buyer_email: model.text(),
  buyer_phone: model.text().nullable(),
  status: model.enum(["new", "read", "replied", "archived"]).default("new"),
  replied_at: model.text().nullable(),
  last_message_at: model.text().nullable(),
})

export default ListingInquiry
