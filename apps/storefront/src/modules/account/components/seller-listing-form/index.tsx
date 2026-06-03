"use client"

import { createSellerListing } from "@lib/data/seller-listings"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState, useState } from "react"

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

const SellerListingForm = () => {
  const [category, setCategory] = useState("Produce")
  const [state, formAction] = useActionState(createSellerListing, {
    success: false,
    error: null as string | null,
  })

  return (
    <form action={formAction} className="rounded-md border border-gray-200 bg-white p-4">
      <div className="mb-4">
        <h2 className="text-large-semi">Create farming listing</h2>
        <p className="mt-1 text-small-regular text-ui-fg-subtle">
          Add enough detail for buyers to understand product, quantity,
          location, and availability.
        </p>
      </div>

      {state.success && (
        <div className="mb-4 rounded-md bg-green-50 px-3 py-2 text-small-regular text-green-700">
          Listing submitted for review.
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
          description="Use a buyer-friendly title and describe quality, packaging, inspection details, and any limits."
        />

        <Input label="Title" name="title" required />

        <label className="flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
          Description<span className="text-rose-500">*</span>
          <textarea
            name="description"
            required
            rows={5}
            className="w-full rounded-md border border-ui-border-base bg-ui-bg-field px-4 py-3 text-ui-fg-base outline-none hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active"
          />
        </label>

        <FormSection
          title="Photos"
          description="Upload clear photos or paste image URLs. Listings with real photos are easier to approve and trust."
        />

        <label className="flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
          Upload photos
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
            className="w-full rounded-md border border-ui-border-base bg-ui-bg-field px-4 py-3 text-ui-fg-base outline-none hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active"
          />
        </label>

        <FormSection
          title="Marketplace details"
          description="These fields power buyer filters, saved searches, and listing review."
        />

        <div className="grid grid-cols-1 gap-4 small:grid-cols-[1fr_140px]">
          <Input label="Price" name="price" type="number" min="1" required />
          <label className="flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
            Currency
            <select
              name="currency_code"
              defaultValue="eur"
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
          <Input label="Farm or pickup location" name="location" />
          <Input label="Quantity" name="quantity" />
          <Input label="Unit" name="unit" />
          <Input label="Availability" name="availability" />
          <label className="flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
            Condition
            <select
              name="condition"
              defaultValue=""
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
              defaultValue=""
              className="h-11 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-ui-fg-base"
            >
              <option value="">Any contact method</option>
              <option value="Phone">Phone</option>
              <option value="Email">Email</option>
            </select>
          </label>
        </div>

        <CategoryGuidance category={category} />

        <CategorySpecificFields category={category} />

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-small-regular text-ui-fg-subtle">
          Before submitting, check that price, location, quantity, availability,
          photos, and contact preference are clear. Admins review listings before
          they appear to buyers.
        </div>

        <SubmitButton data-testid="create-listing-button">
          Submit for review
        </SubmitButton>
      </div>
    </form>
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

const CategorySpecificFields = ({ category }: { category: string }) => {
  if (category === "Produce") {
    return (
      <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
        <Input label="Variety" name="variety" />
        <Input label="Harvest date or season" name="harvest_date" />
        <label className="flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
          Production method
          <select
            name="production_method"
            defaultValue=""
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
        <Input label="Breed" name="breed" />
        <Input label="Age" name="age" />
        <Input label="Sex" name="sex" />
        <Input label="Health or vaccination notes" name="health_notes" />
      </div>
    )
  }

  if (category === "Equipment" || category === "Tools") {
    return (
      <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
        <Input label="Brand" name="brand" />
        <Input label="Model" name="equipment_model" />
        <Input label="Year" name="year" />
      </div>
    )
  }

  if (category === "Seeds" || category === "Fertilizer") {
    return (
      <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
        <Input label="Variety or type" name="variety" />
        <Input label="Pack size" name="pack_size" />
        <Input label="Expiry or production date" name="expiry_date" />
      </div>
    )
  }

  if (category === "Services") {
    return (
      <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
        <Input label="Service area" name="service_area" />
      </div>
    )
  }

  return null
}

export default SellerListingForm
