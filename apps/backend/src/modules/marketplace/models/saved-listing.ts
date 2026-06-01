import { model } from "@medusajs/framework/utils"

const SavedListing = model.define("saved_listing", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  product_id: model.text(),
  listing_id: model.text(),
})

export default SavedListing
