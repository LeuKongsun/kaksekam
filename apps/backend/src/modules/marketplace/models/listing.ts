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
  quantity: model.text().nullable(),
  unit: model.text().nullable(),
  availability: model.text().nullable(),
  condition: model.text().nullable(),
  contact_preference: model.text().nullable(),
  variety: model.text().nullable(),
  production_method: model.text().nullable(),
  harvest_date: model.text().nullable(),
  breed: model.text().nullable(),
  age: model.text().nullable(),
  sex: model.text().nullable(),
  health_notes: model.text().nullable(),
  brand: model.text().nullable(),
  equipment_model: model.text().nullable(),
  year: model.text().nullable(),
  pack_size: model.text().nullable(),
  expiry_date: model.text().nullable(),
  service_area: model.text().nullable(),
})

export default Listing
