"use client"

import { SellerListing, updateSellerListing } from "@lib/data/seller-listings"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import RichTextEditor from "@modules/account/components/rich-text-editor"
import { Photo, PlusMini, XMarkMini } from "@medusajs/icons"
import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import type { ChangeEvent, DragEvent, SelectHTMLAttributes } from "react"

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
const MAX_PHOTO_FILE_SIZE = 5 * 1024 * 1024
const MAX_PHOTO_TOTAL_SIZE = 24 * 1024 * 1024
const supportedCurrencyCodes = new Set(["khr", "usd"])
const selectFieldClassName =
  "h-11 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 pb-1 pt-4 text-ui-fg-base hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active focus:outline-none"
const formatFileSize = (bytes: number) =>
  `${(bytes / 1024 / 1024).toFixed(bytes >= 1024 * 1024 ? 1 : 0)}MB`
const createImageId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

type ExistingImageItem = {
  id: string
  type: "existing"
  url: string
}

type NewImageItem = {
  id: string
  type: "new"
  file: File
}

type ImageItem = ExistingImageItem | NewImageItem

const SellerListingEditor = ({ listing }: SellerListingEditorProps) => {
  const existingImages = useMemo(() => getListingImages(listing), [listing])
  const initialImageItems = useMemo(
    () =>
      existingImages.map((url, index) => ({
        id: `existing-${index}-${url}`,
        type: "existing" as const,
        url,
      })),
    [existingImages],
  )
  const [category, setCategory] = useState(listing.category ?? "Produce")
  const [imageItems, setImageItems] = useState<ImageItem[]>(initialImageItems)
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({})
  const [imageError, setImageError] = useState<string | null>(null)
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [state, formAction] = useActionState(
    updateSellerListing.bind(null, listing.id),
    {
      success: false,
      error: null as string | null,
    },
  )
  const canEdit = editableStatuses.has(listing.status)
  const amount = listing.price?.calculated_amount
  const listingCurrencyCode = listing.price?.currency_code ?? "khr"
  const currencyCode = supportedCurrencyCodes.has(listingCurrencyCode)
    ? listingCurrencyCode
    : "khr"

  useEffect(() => {
    setImageItems(initialImageItems)
  }, [initialImageItems])

  const newImageItems = useMemo(
    () =>
      imageItems.filter((item): item is NewImageItem => item.type === "new"),
    [imageItems],
  )

  useEffect(() => {
    const previews = newImageItems.reduce<Record<string, string>>(
      (acc, item) => {
        acc[item.id] = URL.createObjectURL(item.file)

        return acc
      },
      {},
    )

    setImagePreviews(previews)

    return () =>
      Object.values(previews).forEach((preview) => URL.revokeObjectURL(preview))
  }, [newImageItems])

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

    setImageItems((currentItems) => {
      const remainingSlots = Math.max(
        0,
        MAX_PHOTO_UPLOADS - currentItems.length,
      )
      const newItems = selectedFiles.slice(0, remainingSlots).map((file) => ({
        id: `new-${createImageId()}`,
        type: "new" as const,
        file,
      }))
      const nextItems = [...currentItems, ...newItems]
      const totalNewImageSize = nextItems
        .filter((item): item is NewImageItem => item.type === "new")
        .reduce((sum, item) => sum + item.file.size, 0)

      if (totalNewImageSize > MAX_PHOTO_TOTAL_SIZE) {
        setImageError(
          `New photos are ${formatFileSize(
            totalNewImageSize,
          )} total. Please keep uploads under ${formatFileSize(
            MAX_PHOTO_TOTAL_SIZE,
          )}.`,
        )
        event.target.value = ""

        return currentItems
      }

      setImageError(null)

      syncImageInput(
        nextItems
          .filter((item): item is NewImageItem => item.type === "new")
          .map((item) => item.file),
      )

      return nextItems
    })
  }

  const removeImage = (idToRemove: string) => {
    setImageItems((currentItems) => {
      const nextItems = currentItems.filter((item) => item.id !== idToRemove)

      syncImageInput(
        nextItems
          .filter((item): item is NewImageItem => item.type === "new")
          .map((item) => item.file),
      )

      return nextItems
    })
  }

  const moveImage = (fromId: string, toId: string) => {
    if (fromId === toId) {
      return
    }

    setImageItems((currentItems) => {
      const fromIndex = currentItems.findIndex((item) => item.id === fromId)
      const toIndex = currentItems.findIndex((item) => item.id === toId)

      if (fromIndex < 0 || toIndex < 0) {
        return currentItems
      }

      const nextItems = [...currentItems]
      const [movedItem] = nextItems.splice(fromIndex, 1)
      nextItems.splice(toIndex, 0, movedItem)

      syncImageInput(
        nextItems
          .filter((item): item is NewImageItem => item.type === "new")
          .map((item) => item.file),
      )

      return nextItems
    })
  }

  const handleImageDragStart = (
    event: DragEvent<HTMLDivElement>,
    imageId: string,
  ) => {
    setDraggedImageId(imageId)
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", imageId)
  }

  const handleImageDrop = (
    event: DragEvent<HTMLDivElement>,
    targetImageId: string,
  ) => {
    event.preventDefault()

    const sourceImageId =
      event.dataTransfer.getData("text/plain") || draggedImageId

    if (sourceImageId) {
      moveImage(sourceImageId, targetImageId)
    }

    setDraggedImageId(null)
  }

  if (!canEdit) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-5 text-small-regular text-ui-fg-subtle shadow-sm">
        This listing can no longer be edited.
      </div>
    )
  }

  const remainingPhotoSlots = Math.max(0, MAX_PHOTO_UPLOADS - imageItems.length)
  const imageOrder = imageItems
    .map((item) => (item.type === "existing" ? item.url : `new:${item.id}`))
    .join("\n")

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

      <input
        type="hidden"
        name="image_urls"
        value={imageItems
          .filter((item): item is ExistingImageItem => item.type === "existing")
          .map((item) => item.url)
          .join("\n")}
      />
      <input type="hidden" name="image_order" value={imageOrder} />

      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Title"
          name="title"
          defaultValue={listing.title}
          required
        />

        <RichTextEditor
          label="Description"
          name="description"
          defaultValue={listing.description}
          required
        />

        <FormSection
          title="Photos"
          description="Keep current photos and add clear new photos for review."
        />

        <div className="flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
          <div className="flex items-center justify-between gap-3">
            <span>Upload photos</span>
            <span className="text-xsmall-regular text-ui-fg-muted">
              {imageItems.length}/{MAX_PHOTO_UPLOADS}
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
            {imageItems.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={(event) => handleImageDragStart(event, item.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleImageDrop(event, item.id)}
                onDragEnd={() => setDraggedImageId(null)}
                className="relative h-24 w-24 shrink-0 cursor-grab overflow-hidden rounded-md border border-ui-border-base bg-ui-bg-subtle active:cursor-grabbing"
              >
                {item.type === "existing" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={`Listing photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    aria-label={`Listing photo ${index + 1}`}
                    className="h-full w-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${imagePreviews[item.id] ?? ""})`,
                    }}
                  />
                )}
                <span className="absolute bottom-1 left-1 rounded-md bg-white/90 px-1.5 py-0.5 text-xsmall-semi font-medium text-ui-fg-subtle shadow-sm">
                  {index === 0
                    ? "Cover"
                    : item.type === "existing"
                      ? "Current"
                      : "New"}
                </span>
                <button
                  type="button"
                  aria-label={`Remove listing photo ${index + 1}`}
                  onClick={() => removeImage(item.id)}
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
                {imageItems.length ? <PlusMini /> : <Photo />}
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
        </div>

        <CategoryGuidance category={category} />

        <CategorySpecificFields />

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-small-regular text-ui-fg-subtle">
          Review price, location, quantity, and photos before saving. Active
          listings are hidden while edited changes wait for review.
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

const getListingImages = (listing: SellerListing) =>
  Array.from(
    new Set([listing.thumbnail, ...(listing.image_urls ?? [])]),
  ).filter(Boolean) as string[]

export default SellerListingEditor
