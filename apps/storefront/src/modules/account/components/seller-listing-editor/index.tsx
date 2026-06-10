"use client"

import {
  SellerListing,
  updateSellerListing,
} from "@lib/data/seller-listings"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState, useState } from "react"

type SellerListingEditorProps = {
  listing: SellerListing
}

const editableStatuses = new Set<SellerListing["status"]>([
  "draft",
  "pending_review",
  "active",
  "rejected",
])

const categoryOptions = [
  "Produce",
  "Livestock",
  "Seeds",
  "Fertilizer",
  "Equipment",
  "Tools",
  "Services",
  "Other",
]

const SellerListingEditor = ({ listing }: SellerListingEditorProps) => {
  const [category, setCategory] = useState(listing.category ?? "Produce")
  const [state, formAction] = useActionState(
    updateSellerListing.bind(null, listing.id),
    {
      success: false,
      error: null as string | null,
    }
  )
  const canEdit = editableStatuses.has(listing.status)
  const amount = listing.price?.calculated_amount
  const currencyCode = listing.price?.currency_code ?? "eur"

  return (
    <div>
      {canEdit ? (
        <form
          action={formAction}
          className="rounded-md border border-gray-200 bg-white p-5 text-left shadow-sm"
        >
          <div className="mb-4">
            <h3 className="text-base-semi">Edit listing</h3>
            <p className="text-small-regular text-ui-fg-subtle">
              Saving changes sends the listing back to review.
            </p>
          </div>

          {state.success && (
            <div className="mb-4 rounded-md bg-green-50 px-3 py-2 text-small-regular text-green-700">
              Listing updated and sent for review.
            </div>
          )}
          {state.error && (
            <div className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-small-regular text-rose-700">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <FormSection
              title="Listing basics"
              description="Saving changes sends this listing back through review, so keep buyer-facing details complete."
            />

            <Input
              label="Title"
              name="title"
              defaultValue={listing.title}
              required
            />

            <label className="flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
              Description<span className="text-rose-500">*</span>
              <textarea
                name="description"
                required
                rows={4}
                defaultValue={listing.description ?? ""}
                className="w-full rounded-md border border-ui-border-base bg-ui-bg-field px-4 py-3 text-ui-fg-base outline-none hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active"
              />
            </label>

            <FormSection
              title="Photos"
              description="Add clear photos or keep existing image URLs so buyers can inspect the listing before contacting you."
            />

            <label className="flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
              Upload more photos
              <input
                name="images"
                type="file"
                accept="image/*"
                multiple
                className="block w-full rounded-md border border-ui-border-base bg-ui-bg-field px-4 py-3 text-ui-fg-base file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-small-regular file:text-ui-fg-base hover:bg-ui-bg-field-hover"
              />
            </label>

            <label className="flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
              Photo URLs
              <textarea
                name="image_urls"
                rows={3}
                defaultValue={listing.image_urls.join("\n")}
                className="w-full rounded-md border border-ui-border-base bg-ui-bg-field px-4 py-3 text-ui-fg-base outline-none hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active"
              />
            </label>

            <FormSection
              title="Marketplace details"
              description="These fields affect buyer filters, saved searches, and moderation review."
            />

            <div className="grid grid-cols-1 gap-4 small:grid-cols-[1fr_140px]">
              <Input
                label="Price"
                name="price"
                type="number"
                min="1"
                defaultValue={amount ?? ""}
                required
              />
              <label className="flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
                Currency
                <select
                  name="currency_code"
                  defaultValue={currencyCode}
                  className="h-11 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-ui-fg-base"
                >
                  <option value="eur">EUR</option>
                  <option value="usd">USD</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
              <label className="flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
                Farming category
                <select
                  name="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="h-11 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-ui-fg-base"
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <Input
                label="Farm or pickup location"
                name="location"
                defaultValue={listing.location ?? ""}
              />
              <Input
                label="Quantity"
                name="quantity"
                defaultValue={listing.quantity ?? ""}
              />
              <Input
                label="Unit"
                name="unit"
                defaultValue={listing.unit ?? ""}
              />
              <Input
                label="Availability"
                name="availability"
                defaultValue={listing.availability ?? ""}
              />
              <label className="flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
                Condition
                <select
                  name="condition"
                  defaultValue={listing.condition ?? ""}
                  className="h-11 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-ui-fg-base"
                >
                  <option value="">Not specified</option>
                  <option value="Fresh">Fresh</option>
                  <option value="Organic">Organic</option>
                  <option value="Used">Used</option>
                  <option value="New">New</option>
                </select>
              </label>
              <label className="flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
                Preferred contact
                <select
                  name="contact_preference"
                  defaultValue={listing.contact_preference ?? ""}
                  className="h-11 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-ui-fg-base"
                >
                  <option value="">Any contact method</option>
                  <option value="Phone">Phone</option>
                  <option value="Email">Email</option>
                </select>
              </label>
            </div>

            <CategoryGuidance category={category} />

            <CategorySpecificFields listing={listing} category={category} />

            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-small-regular text-ui-fg-subtle">
              Review price, location, quantity, availability, and contact
              preference before saving. Active listings are hidden while edited
              changes wait for review.
            </div>

            <SubmitButton data-testid="update-listing-button">
              Save changes
            </SubmitButton>
          </div>
        </form>
      ) : (
        <div className="rounded-md border border-gray-200 bg-white p-5 text-small-regular text-ui-fg-subtle shadow-sm">
          This listing can no longer be edited.
        </div>
      )}
    </div>
  )
}

const FormSection = ({
  title,
  description,
}: {
  title: string
  description: string
}) => (
  <div className="border-t border-gray-200 pt-4 first:border-t-0 first:pt-0">
    <h3 className="text-base-semi">{title}</h3>
    <p className="mt-1 text-small-regular text-ui-fg-subtle">{description}</p>
  </div>
)

const categoryGuidance: Record<string, string> = {
  Produce: "Add variety, harvest season, and production method so buyers can judge freshness and fit.",
  Livestock: "Add breed, age, sex, and health notes. Buyers need enough information before arranging inspection.",
  Seeds: "Add variety, pack size, and production or expiry date.",
  Fertilizer: "Add type, pack size, and expiry or production date.",
  Equipment: "Add brand, model, year, and condition so buyers can compare equipment quickly.",
  Tools: "Add brand, model, year, and condition for easier inspection planning.",
  Services: "Add service area and describe what is included in the service.",
  Other: "Add any category-specific details buyers need before contacting you.",
}

const CategoryGuidance = ({ category }: { category: string }) => (
  <div className="rounded-md border border-gray-200 bg-white p-4 text-small-regular text-ui-fg-subtle">
    <span className="font-semibold text-ui-fg-base">{category} details: </span>
    {categoryGuidance[category] ?? categoryGuidance.Other}
  </div>
)

const CategorySpecificFields = ({
  listing,
  category,
}: {
  listing: SellerListing
  category: string
}) => {
  if (category === "Produce") {
    return (
      <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
        <Input label="Variety" name="variety" defaultValue={listing.variety ?? ""} />
        <Input
          label="Harvest date or season"
          name="harvest_date"
          defaultValue={listing.harvest_date ?? ""}
        />
        <label className="flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
          Production method
          <select
            name="production_method"
            defaultValue={listing.production_method ?? ""}
            className="h-11 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-ui-fg-base"
          >
            <option value="">Not specified</option>
            <option value="Organic">Organic</option>
            <option value="Conventional">Conventional</option>
            <option value="Regenerative">Regenerative</option>
          </select>
        </label>
      </div>
    )
  }

  if (category === "Livestock") {
    return (
      <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
        <Input label="Breed" name="breed" defaultValue={listing.breed ?? ""} />
        <Input label="Age" name="age" defaultValue={listing.age ?? ""} />
        <Input label="Sex" name="sex" defaultValue={listing.sex ?? ""} />
        <Input
          label="Health or vaccination notes"
          name="health_notes"
          defaultValue={listing.health_notes ?? ""}
        />
      </div>
    )
  }

  if (category === "Equipment" || category === "Tools") {
    return (
      <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
        <Input label="Brand" name="brand" defaultValue={listing.brand ?? ""} />
        <Input
          label="Model"
          name="equipment_model"
          defaultValue={listing.equipment_model ?? ""}
        />
        <Input label="Year" name="year" defaultValue={listing.year ?? ""} />
      </div>
    )
  }

  if (category === "Seeds" || category === "Fertilizer") {
    return (
      <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
        <Input
          label="Variety or type"
          name="variety"
          defaultValue={listing.variety ?? ""}
        />
        <Input
          label="Pack size"
          name="pack_size"
          defaultValue={listing.pack_size ?? ""}
        />
        <Input
          label="Expiry or production date"
          name="expiry_date"
          defaultValue={listing.expiry_date ?? ""}
        />
      </div>
    )
  }

  if (category === "Services") {
    return (
      <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
        <Input
          label="Service area"
          name="service_area"
          defaultValue={listing.service_area ?? ""}
        />
      </div>
    )
  }

  return null
}

export default SellerListingEditor
