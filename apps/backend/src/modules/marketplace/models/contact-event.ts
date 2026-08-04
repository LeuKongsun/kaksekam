import { model } from "@medusajs/framework/utils"

const ContactEvent = model.define("contact_event", {
  id: model.id().primaryKey(),
  listing_id: model.text(),
  seller_id: model.text(),
  channel: model.enum(["telegram", "messenger", "phone"]),
  referrer: model.text().nullable(),
})

export default ContactEvent
