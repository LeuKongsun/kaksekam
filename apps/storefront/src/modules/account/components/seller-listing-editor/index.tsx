"use client"

import {
  SellerListing,
  updateSellerListing,
} from "@lib/data/seller-listings"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { Photo, PlusMini, XMarkMini } from "@medusajs/icons"
import {
  ChangeEvent,
  SelectHTMLAttributes,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

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

const MAX_PHOTO_UPLOADS = 6
const supportedCurrencyCodes = new Set(["khr", "usd"])
const selectFieldClassName =
  "h-11 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 pb-1 pt-4 text-ui-fg-base hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active focus:outline-none"

const SellerListingEditor = ({ listing }: SellerListingEditorProps) => {
  const existingImages = useMemo(() => getListingImages(listing), [listing])
  const [category, setCategory] = useState(listing.category ?? "Produce")
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [state, formAction] = useActionState(
    updateSellerListing.bind(null, listing.id),
    {
      success: false,
      error: null as string | null,
    }
  )
  const canEdit = editableStatuses.has(listing.status)
  const amount = listing.price?.calculated_amount
  const listingCurrencyCode = listing.price?.currency_code ?? "khr"
  const currencyCode = supportedCurrencyCodes.has(listingCurrencyCode)
    ? listingCurrencyCode
    : "khr"

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
        Math.max(0, MAX_PHOTO_UPLOADS - existingImages.length)
      )

      syncImageInput(mergedFiles)

      return mergedFiles
    })
  }

  const removeImage = (indexToRemove: number) => {
    setImageFiles((currentFiles) => {
      const nextFiles = currentFiles.filter(
        (_file, index) => index !== indexToRemove
      )

      syncImageInput(nextFiles)

      return nextFiles
    })
  }

  if (!canEdit) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-5 text-small-regular text-ui-fg-subtle shadow-sm">
        This listing can no longer be edited.
      </div>
    )
  }

  const remainingPhotoSlots = Math.max(
    0,
    MAX_PHOTO_UPLOADS - existingImages.length - imageFiles.length
  )

  return (
    <form
      action={formAction}
      className="rounded-md border border-gray-200 bg-white p-4"
    >
      <div className="mb-4">
        <h2 className="text-large-semi">Edit product</h2>
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

      <input type="hidden" name="image_urls" value={existingImages.join("\n")} />

      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Title"
          name="title"
          defaultValue={listing.title}
          required
        />

        <label className="flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
          <span>
            Description<span className="text-rose-500">*</span>
          </span>
          <textarea
            name="description"
            required
            rows={5}
            defaultValue={listing.description ?? ""}
            className="w-full rounded-md border border-ui-border-base bg-ui-bg-field px-4 py-3 text-ui-fg-base outline-none hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active"
          />
        </label>

        <FormSection
          title="Photos"
          description="Keep current photos and add clear new photos for review."
        />

        <div className="flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
          <div className="flex items-center justify-between gap-3">
            <span>Upload photos</span>
            <span className="text-xsmall-regular text-ui-fg-muted">
              {existingImages.length + imageFiles.length}/{MAX_PHOTO_UPLOADS}
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
            {existingImages.map((imageUrl, index) => (
              <div
                key={imageUrl}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-ui-border-base bg-ui-bg-subtle"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={`Current photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-1 left-1 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-ui-fg-subtle shadow-sm">
                  Current
                </span>
              </div>
            ))}
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
            {remainingPhotoSlots > 0 && (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-ui-border-base bg-ui-bg-field text-ui-fg-subtle transition-colors hover:bg-ui-bg-field-hover hover:text-ui-fg-base focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2"
              >
                {imageFiles.length || existingImages.length ? (
                  <PlusMini />
                ) : (
                  <Photo />
                )}
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
          <Input
            label="Price"
            name="price"
            type="number"
            min="1"
            defaultValue={amount ?? ""}
            required
          />
          <SelectField
            label="Currency"
            name="currency_code"
            defaultValue={currencyCode}
          >
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
          <Input label="Unit" name="unit" defaultValue={listing.unit ?? ""} />
          <Input
            label="Availability"
            name="availability"
            defaultValue={listing.availability ?? ""}
          />
          <SelectField
            label="Condition"
            name="condition"
            defaultValue={listing.condition ?? ""}
          >
            <option value="">Not specified</option>
            <option value="Fresh">Fresh</option>
            <option value="Organic">Organic</option>
            <option value="Used">Used</option>
            <option value="New">New</option>
          </SelectField>
          <SelectField
            label="Preferred contact"
            name="contact_preference"
            defaultValue={listing.contact_preference ?? ""}
          >
            <option value="">Any contact method</option>
            <option value="Phone">Phone</option>
            <option value="Email">Email</option>
          </SelectField>
        </div>

        <CategoryGuidance category={category} />

        <CategorySpecificFields listing={listing} category={category} />

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-small-regular text-ui-fg-subtle">
          Review price, location, quantity, availability, photos, and contact
          preference before saving. Active listings are hidden while edited
          changes wait for review.
        </div>

        <SubmitButton data-testid="update-listing-button">
          Save changes
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
        <Input
          label="Variety"
          name="variety"
          defaultValue={listing.variety ?? ""}
        />
        <Input
          label="Harvest date or season"
          name="harvest_date"
          defaultValue={listing.harvest_date ?? ""}
        />
        <SelectField
          label="Production method"
          name="production_method"
          defaultValue={listing.production_method ?? ""}
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

const getListingImages = (listing: SellerListing) =>
  Array.from(new Set([listing.thumbnail, ...(listing.image_urls ?? [])])).filter(
    Boolean
  ) as string[]

export default SellerListingEditor
