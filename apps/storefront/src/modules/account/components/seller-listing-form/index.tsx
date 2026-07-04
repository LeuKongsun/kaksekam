"use client"

import {
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
} from "@lib/marketplace/listing-fields"
import { createSellerListing } from "@lib/data/seller-listings"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import RichTextEditor from "@modules/account/components/rich-text-editor"
import { Photo, PlusMini, XMarkMini } from "@medusajs/icons"
import {
  ChangeEvent,
  SelectHTMLAttributes,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react"

const categoryOptions = LISTING_CATEGORIES

const MAX_PHOTO_UPLOADS = 6
const MAX_PHOTO_FILE_SIZE = 5 * 1024 * 1024
const MAX_PHOTO_TOTAL_SIZE = 24 * 1024 * 1024
const selectFieldClassName =
  "h-11 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 pb-1 pt-4 text-ui-fg-base hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active focus:outline-none"
const formatFileSize = (bytes: number) =>
  `${(bytes / 1024 / 1024).toFixed(bytes >= 1024 * 1024 ? 1 : 0)}MB`

const SellerListingForm = () => {
  const [category, setCategory] = useState("Produce")
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageError, setImageError] = useState<string | null>(null)
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

    const oversizedFile = selectedFiles.find(
      (file) => file.size > MAX_PHOTO_FILE_SIZE,
    )

    if (oversizedFile) {
      setImageError(
        `${oversizedFile.name} is ${formatFileSize(
          oversizedFile.size,
        )}. Please choose photos under ${formatFileSize(MAX_PHOTO_FILE_SIZE)}.`,
      )
      event.target.value = ""
      return
    }

    setImageFiles((currentFiles) => {
      const mergedFiles = [...currentFiles, ...selectedFiles].slice(
        0,
        MAX_PHOTO_UPLOADS,
      )
      const totalSize = mergedFiles.reduce((sum, file) => sum + file.size, 0)

      if (totalSize > MAX_PHOTO_TOTAL_SIZE) {
        setImageError(
          `Selected photos are ${formatFileSize(
            totalSize,
          )} total. Please keep uploads under ${formatFileSize(
            MAX_PHOTO_TOTAL_SIZE,
          )}.`,
        )
        event.target.value = ""
        syncImageInput(currentFiles)

        return currentFiles
      }

      setImageError(null)

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

        <RichTextEditor label="Description" name="description" required />

        <FormSection
          title="Photos"
          description="Upload clear photos. Products with real photos are easier to approve and trust."
        />

        <div className="flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
          <div className="flex items-center justify-between gap-3">
            <span>Upload photos</span>
            <span className="text-xsmall-regular text-ui-fg-muted">
              {imageFiles.length}/{MAX_PHOTO_UPLOADS}
            </span>
          </div>
          {imageError && (
            <span className="text-small-regular text-rose-600">
              {imageError}
            </span>
          )}
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
          <SelectField label="Condition" name="condition" defaultValue="">
            <option value="">Not specified</option>
            {LISTING_CONDITIONS.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </SelectField>
        </div>

        <CategoryGuidance category={category} />

        <CategorySpecificFields />

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-small-regular text-ui-fg-subtle">
          Before submitting, check that price, location, quantity, and photos
          are clear. Admins review listings before they appear to buyers.
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
  Produce: "Use the description for any freshness or source notes.",
  Livestock: "Use the description for animal details and inspection notes.",
  Seeds: "Use the description for seed details.",
  Fertilizer: "Use the description for product details.",
  Equipment: "Use the description for equipment details.",
  Tools: "Use the description for tool details.",
  Services: "Use the description for service details.",
  Other: "Use the description for any extra details buyers need.",
}

const CategoryGuidance = ({ category }: { category: string }) => (
  <div className="rounded-md border border-gray-200 bg-white p-4 text-small-regular text-ui-fg-subtle">
    <span className="font-semibold text-ui-fg-base">{category} details: </span>
    {categoryGuidance[category] ?? categoryGuidance.Other}
  </div>
)

const CategorySpecificFields = () => {
  return null
}

export default SellerListingForm
