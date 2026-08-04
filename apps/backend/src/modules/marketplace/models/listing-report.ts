import { model } from "@medusajs/framework/utils"

const ListingReport = model.define("listing_report", {
  id: model.id().primaryKey(),
  listing_id: model.text(),
  seller_id: model.text(),
  reason: model.enum([
    "unavailable",
    "misleading",
    "fraud",
    "prohibited",
    "other",
  ]),
  details: model.text().nullable(),
  reporter_contact: model.text().nullable(),
  status: model.enum(["new", "resolved", "dismissed"]).default("new"),
  resolution_note: model.text().nullable(),
  reviewed_by: model.text().nullable(),
  reviewed_at: model.dateTime().nullable(),
})

export default ListingReport
