"use client"

import { createSellerListing } from "@lib/data/seller-listings"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { Photo, PlusMini, XMarkMini } from "@medusajs/icons"
import {
  ChangeEvent,
  SelectHTMLAttributes,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react"

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

const MAX_PHOTO_UPLOADS = 6
const selectFieldClassName =
  "h-11 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 pb-1 pt-4 text-ui-fg-base hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active focus:outline-none"

const SellerListingForm = () => {
  const [category, setCategory] = useState("Produce")
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [state, formAction] = useActionState(createSellerListing, {
    success: false,
    error: null as string | null,
  })

  useEffect(() => {
    const previews = imageFiles.map((file) => URL.createObjectURL(file))

    setImagePreviews(previews)

    return () => previews.forEach((preview) => URL.revokeObjectURL(preview))
  }, [imageFiles])

  const syncImageInput = (files: File[]) => {
    if (!imageInputRef.current || typeof DataTransfer === "undefined") {
      return
    }

    const transfer = new DataTransfer()
    files.forEach((file) => transfer.items.add(file))
    imageInputRef.current.files = transfer.files
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])

    if (!selectedFiles.length) {
      return
    }

    setImageFiles((currentFiles) => {
      const mergedFiles = [...currentFiles, ...selectedFiles].slice(
        0,
        MAX_PHOTO_UPLOADS,
      )

      syncImageInput(mergedFiles)

      return mergedFiles
    })
  }

  const removeImage = (indexToRemove: number) => {
    setImageFiles((currentFiles) => {
      const nextFiles = currentFiles.filter(
        (_file, index) => index !== indexToRemove,
      )

      syncImageInput(nextFiles)

      return nextFiles
    })
  }

  return (
    <form
      action={formAction}
      className="rounded-md border border-gray-200 bg-white p-4"
    >
      <div className="mb-4">
        <h2 className="text-large-semi">New product</h2>
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
          <span>
            Description<span className="text-rose-500">*</span>
          </span>
          <textarea
            name="description"
            required
            rows={5}
            className="w-full rounded-md border border-ui-border-base bg-ui-bg-field px-4 py-3 text-ui-fg-base outline-none hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active"
          />
        </label>

        <FormSection
          title="Photos"
          description="Upload clear photos. Listings with real photos are easier to approve and trust."
        />

        <div className="flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
          <div className="flex items-center justify-between gap-3">
            <span>Upload photos</span>
            <span className="text-xsmall-regular text-ui-fg-muted">
              {imageFiles.length}/{MAX_PHOTO_UPLOADS}
            </span>
          </div>
          <input
            ref={imageInputRef}
            name="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="sr-only"
          />
          <div className="flex gap-3 overflow-x-auto pb-1">
            {imagePreviews.map((preview, index) => (
              <div
                key={`${imageFiles[index]?.name ?? "photo"}-${index}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-ui-border-base bg-ui-bg-subtle"
              >
                <div
                  aria-label={`Selected photo ${index + 1}`}
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${preview})` }}
                />
                <button
                  type="button"
                  aria-label={`Remove photo ${index + 1}`}
                  onClick={() => removeImage(index)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-ui-fg-subtle shadow-elevation-card-rest transition-colors hover:text-ui-fg-base"
                >
                  <XMarkMini />
                </button>
              </div>
            ))}
            {imageFiles.length < MAX_PHOTO_UPLOADS && (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-ui-border-base bg-ui-bg-field text-ui-fg-subtle transition-colors hover:bg-ui-bg-field-hover hover:text-ui-fg-base focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2"
              >
                {imageFiles.length ? <PlusMini /> : <Photo />}
                <span className="text-xsmall-regular">Add photo</span>
              </button>
            )}
          </div>
        </div>

        <FormSection
          title="Marketplace details"
          description="These fields power buyer filters, saved searches, and listing review."
        />

        <div className="grid grid-cols-1 gap-4 small:grid-cols-[1fr_140px]">
          <Input label="Price" name="price" type="number" min="1" required />
          <SelectField label="Currency" name="currency_code" defaultValue="khr">
            <option value="khr">KHR</option>
            <option value="usd">USD</option>
          </SelectField>
        </div>

        <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
          <SelectField
            label="Farming category"
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </SelectField>
          <Input label="Farm or pickup location" name="location" />
          <Input label="Quantity" name="quantity" />
          <Input label="Unit" name="unit" />
          <Input label="Availability" name="availability" />
          <SelectField label="Condition" name="condition" defaultValue="">
            <option value="">Not specified</option>
            <option value="Fresh">Fresh</option>
            <option value="Organic">Organic</option>
            <option value="Used">Used</option>
            <option value="New">New</option>
          </SelectField>
          <SelectField
            label="Preferred contact"
            name="contact_preference"
            defaultValue=""
          >
            <option value="">Any contact method</option>
            <option value="Phone">Phone</option>
            <option value="Email">Email</option>
          </SelectField>
        </div>

        <CategoryGuidance category={category} />

        <CategorySpecificFields category={category} />

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-small-regular text-ui-fg-subtle">
          Before submitting, check that price, location, quantity, availability,
          photos, and contact preference are clear. Admins review listings
          before they appear to buyers.
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

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
}

const SelectField = ({ label, children, ...props }: SelectFieldProps) => (
  <label className="relative flex w-full text-small-regular text-ui-fg-subtle">
    <select {...props} className={selectFieldClassName}>
      {children}
    </select>
    <span className="pointer-events-none absolute left-3 top-1 text-xsmall-regular text-ui-fg-subtle">
      {label}
    </span>
  </label>
)

const categoryGuidance: Record<string, string> = {
  Produce:
    "Add variety, harvest season, and production method so buyers can judge freshness and fit.",
  Livestock:
    "Add breed, age, sex, and health notes. Buyers need enough information before arranging inspection.",
  Seeds: "Add variety, pack size, and production or expiry date.",
  Fertilizer: "Add type, pack size, and expiry or production date.",
  Equipment:
    "Add brand, model, year, and condition so buyers can compare equipment quickly.",
  Tools:
    "Add brand, model, year, and condition for easier inspection planning.",
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
        <SelectField
          label="Production method"
          name="production_method"
          defaultValue=""
        >
          <option value="">Not specified</option>
          <option value="Organic">Organic</option>
          <option value="Conventional">Conventional</option>
          <option value="Regenerative">Regenerative</option>
        </SelectField>
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
