import { model } from "@medusajs/framework/utils"

const SavedSearch = model.define("saved_search", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  name: model.text(),
  query: model.text().nullable(),
  category: model.text().nullable(),
  location: model.text().nullable(),
  availability: model.text().nullable(),
  condition: model.text().nullable(),
})

export default SavedSearch
