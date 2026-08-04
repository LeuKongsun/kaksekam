import { model } from "@medusajs/framework/utils"

const Seller = model.define("seller", {
  id: model.id().primaryKey(),
  display_name: model.text().searchable(),
  handle: model.text().unique(),
  customer_id: model.text().nullable(),
  email: model.text().nullable(),
  phone: model.text().nullable(),
  telegram: model.text().nullable(),
  facebook_url: model.text().nullable(),
  preferred_contact: model
    .enum(["telegram", "messenger", "phone"])
    .nullable(),
  location: model.text().nullable(),
  bio: model.text().nullable(),
  avatar_url: model.text().nullable(),
  status: model.enum(["active", "suspended"]).default("active"),
  verification_status: model.enum(["unverified", "verified"]).default("unverified"),
})

export default Seller
