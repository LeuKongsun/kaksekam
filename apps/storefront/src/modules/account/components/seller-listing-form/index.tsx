"use client"

import { createSellerListing } from "@lib/data/seller-listings"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

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
              defaultValue="Produce"
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

        <SubmitButton data-testid="create-listing-button">
          Submit for review
        </SubmitButton>
      </div>
    </form>
  )
}

export default SellerListingForm
