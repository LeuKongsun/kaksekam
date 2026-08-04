import { model } from "@medusajs/framework/utils"

const Listing = model.define("listing", {
  id: model.id().primaryKey(),
  status: model
    .enum(["draft", "pending_review", "active", "sold", "rejected", "expired"])
    .default("draft"),
  moderation_note: model.text().nullable(),
  reviewed_at: model.dateTime().nullable(),
  reviewer_id: model.text().nullable(),
  category: model.text().nullable(),
  location: model.text().nullable(),
  district: model.text().nullable(),
  quantity: model.text().nullable(),
  unit: model.text().nullable(),
  minimum_order: model.text().nullable(),
  condition: model.text().nullable(),
  availability: model.text().nullable(),
  production_method: model.text().nullable(),
  contact_preference: model
    .enum(["telegram", "messenger", "phone"])
    .nullable(),
  negotiable: model.boolean().default(false),
  expires_at: model.dateTime().nullable(),
  refreshed_at: model.dateTime().nullable(),
})

export default Listing
