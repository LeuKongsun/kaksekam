"use client"

import {
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
  LISTING_AVAILABILITY_OPTIONS,
  LISTING_CONTACT_PREFERENCES,
  LISTING_LOCATIONS,
  LISTING_PRODUCTION_METHODS,
} from "@lib/marketplace/listing-fields"
import { SellerListing, updateSellerListing } from "@lib/data/seller-listings"

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
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import RichTextEditor from "@modules/account/components/rich-text-editor"
import { Photo, PlusMini, XMarkMini } from "@medusajs/icons"
import {
  ChangeEvent,
  DragEvent,
  SelectHTMLAttributes,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useTranslation } from "@lib/i18n/context"

type SellerListingEditorProps = {
  listing: SellerListing
}

type ImageItem = ExistingImageItem | NewImageItem

const categoryOptions = LISTING_CATEGORIES

const MAX_PHOTO_UPLOADS = 6
const MAX_PHOTO_FILE_SIZE = 5 * 1024 * 1024
const MAX_PHOTO_TOTAL_SIZE = 24 * 1024 * 1024
const selectFieldClassName =
  "h-11 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2.5 text-ui-fg-base hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active focus:outline-none"
const formatFileSize = (bytes: number) =>
  `${(bytes / 1024 / 1024).toFixed(bytes >= 1024 * 1024 ? 1 : 0)}MB`
const createImageId = () => Math.random().toString(36).substring(2, 9)

const editableStatuses = new Set<SellerListing["status"]>([
  "draft",
  "pending_review",
  "active",
  "rejected",
])

const SellerListingEditor = ({ listing }: SellerListingEditorProps) => {
  const { t } = useTranslation()
  const canEdit = editableStatuses.has(listing.status)
  const currencyCode = (listing.price?.currency_code ?? "khr").toLowerCase()
  const amount = listing.price?.calculated_amount ?? null
  const [category, setCategory] = useState(listing.category ?? "Produce")
  const [imageItems, setImageItems] = useState<ImageItem[]>(() => {
    return getListingImages(listing).map((url, index) => ({
      id: `existing-${index}-${createImageId()}`,
      type: "existing" as const,
      url,
    }))
  })
  const [activeImageId, setActiveImageId] = useState<string | null>(
    () => imageItems[0]?.id ?? null
  )
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({})
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [state, formAction] = useActionState(
    updateSellerListing.bind(null, listing.id),
    {
      success: false,
      error: null as string | null,
    }
  )

  const newImageItems = useMemo(
    () =>
      imageItems.filter((item): item is NewImageItem => item.type === "new"),
    [imageItems]
  )

  useEffect(() => {
    const previews = newImageItems.reduce<Record<string, string>>(
      (acc, item) => {
        acc[item.id] = URL.createObjectURL(item.file)

        return acc
      },
      {}
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
      (file) => file.size > MAX_PHOTO_FILE_SIZE
    )

    if (oversizedFile) {
      setImageError(
        `${oversizedFile.name} is ${formatFileSize(
          oversizedFile.size
        )}. Please choose photos under ${formatFileSize(MAX_PHOTO_FILE_SIZE)}.`
      )
      event.target.value = ""
      return
    }

    setImageItems((currentItems) => {
      const remainingSlots = Math.max(
        0,
        MAX_PHOTO_UPLOADS - currentItems.length
      )
      const newItems = selectedFiles.slice(0, remainingSlots).map((file) => ({
        id: `new-${createImageId()}`,
        type: "new" as const,
        file,
      }))
      const nextItems = [...currentItems, ...newItems]

      if (!activeImageId && newItems[0]) {
        setActiveImageId(newItems[0].id)
      }
      const totalNewImageSize = nextItems
        .filter((item): item is NewImageItem => item.type === "new")
        .reduce((sum, item) => sum + item.file.size, 0)

      if (totalNewImageSize > MAX_PHOTO_TOTAL_SIZE) {
        setImageError(
          `New photos are ${formatFileSize(
            totalNewImageSize
          )} total. Please keep uploads under ${formatFileSize(
            MAX_PHOTO_TOTAL_SIZE
          )}.`
        )
        event.target.value = ""

        return currentItems
      }

      setImageError(null)

      syncImageInput(
        nextItems
          .filter((item): item is NewImageItem => item.type === "new")
          .map((item) => item.file)
      )

      return nextItems
    })
  }

  const removeImage = (idToRemove: string) => {
    setImageItems((currentItems) => {
      const removedIndex = currentItems.findIndex(
        (item) => item.id === idToRemove
      )
      const nextItems = currentItems.filter((item) => item.id !== idToRemove)

      syncImageInput(
        nextItems
          .filter((item): item is NewImageItem => item.type === "new")
          .map((item) => item.file)
      )

      if (activeImageId === idToRemove) {
        setActiveImageId(
          nextItems[Math.min(Math.max(removedIndex, 0), nextItems.length - 1)]
            ?.id ?? null
        )
      }

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
          .map((item) => item.file)
      )

      return nextItems
    })
  }

  const handleImageDragStart = (
    event: DragEvent<HTMLDivElement>,
    imageId: string
  ) => {
    setDraggedImageId(imageId)
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", imageId)
  }

  const handleImageDrop = (
    event: DragEvent<HTMLDivElement>,
    targetImageId: string
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
        {t.account.cannotEdit}
      </div>
    )
  }

  const remainingPhotoSlots = Math.max(0, MAX_PHOTO_UPLOADS - imageItems.length)
  const imageOrder = imageItems
    .map((item) => (item.type === "existing" ? item.url : `new:${item.id}`))
    .join("\n")
  const activeImage =
    imageItems.find((item) => item.id === activeImageId) ?? imageItems[0]
  const activeImageIndex = activeImage
    ? imageItems.findIndex((item) => item.id === activeImage.id)
    : -1
  const activeImageUrl = activeImage
    ? activeImage.type === "existing"
      ? activeImage.url
      : imagePreviews[activeImage.id]
    : undefined

  return (
    <form
      action={formAction}
      className="rounded-md border border-gray-200 bg-white p-4"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-large-semi">{t.account.editProduct}</h2>
        <LocalizedClientLink
          href="/account/listings"
          className="inline-flex h-9 items-center justify-center rounded-md border border-gray-300 px-3 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base"
        >
          {t.common.back}
        </LocalizedClientLink>
      </div>

      {state.success && (
        <div className="mb-4 rounded-md bg-green-50 px-3 py-2 text-small-regular text-green-700">
          {t.account.updateProductSuccess}
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
        <FormSection
          title={t.account.photos}
          description={t.account.photosEditSubtitle}
        />

        <div className="flex flex-col gap-y-3 text-small-regular text-ui-fg-subtle">
          <div className="flex items-center justify-between gap-3">
            <span>{t.account.uploadPhotos}</span>
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
          <div className="relative aspect-video w-full overflow-hidden rounded-md border border-ui-border-base bg-ui-bg-subtle">
            {activeImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeImageUrl}
                alt={`Listing photo ${activeImageIndex + 1}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex h-full w-full flex-col items-center justify-center gap-3 border border-dashed border-ui-border-base text-ui-fg-subtle transition-colors hover:bg-ui-bg-field-hover hover:text-ui-fg-base focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-300"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-elevation-card-rest">
                  <Photo />
                </span>
                <span className="text-small-semi">{t.account.addPhoto}</span>
                <span className="text-xsmall-regular text-ui-fg-muted">
                  {t.account.photosEditSubtitle}
                </span>
              </button>
            )}

            {activeImage && (
              <div className="absolute right-3 top-3 flex items-center gap-2">
                {remainingPhotoSlots > 0 && (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex h-9 items-center gap-2 rounded-md bg-white px-3 text-small-semi text-ui-fg-base shadow-elevation-card-rest transition-colors hover:bg-ui-bg-field-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2"
                  >
                    <PlusMini />
                    {t.account.addPhoto}
                  </button>
                )}
                <button
                  type="button"
                  aria-label={`Remove listing photo ${activeImageIndex + 1}`}
                  onClick={() => removeImage(activeImage.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-ui-fg-subtle shadow-elevation-card-rest transition-colors hover:text-ui-fg-base focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2"
                >
                  <XMarkMini />
                </button>
              </div>
            )}
          </div>

          {imageItems.length > 0 && (
            <div
              className="no-scrollbar flex gap-2 overflow-x-auto pb-1"
              aria-label="Choose and reorder listing photos"
            >
              {imageItems.map((item, index) => {
                const imageUrl =
                  item.type === "existing"
                    ? item.url
                    : imagePreviews[item.id] ?? ""

                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(event) =>
                      handleImageDragStart(event, item.id)
                    }
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleImageDrop(event, item.id)}
                    onDragEnd={() => setDraggedImageId(null)}
                    className="relative h-16 w-20 shrink-0 cursor-grab active:cursor-grabbing"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveImageId(item.id)}
                      aria-label={`Show listing photo ${index + 1}`}
                      aria-current={activeImage?.id === item.id}
                      className={`h-full w-full overflow-hidden rounded-md border bg-ui-bg-subtle transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 ${
                        activeImage?.id === item.id
                          ? "border-ui-fg-base"
                          : "border-ui-border-base hover:border-ui-fg-subtle"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt={`Listing photo ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                    {index === 0 && (
                      <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-white/90 px-1 text-[10px] font-medium text-ui-fg-base shadow-sm">
                        {t.account.cover}
                      </span>
                    )}
                  </div>
                )
              })}
              {remainingPhotoSlots > 0 && (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex h-16 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-ui-border-base bg-ui-bg-field text-ui-fg-subtle transition-colors hover:bg-ui-bg-field-hover hover:text-ui-fg-base focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2"
                >
                  <PlusMini />
                  <span className="text-xsmall-regular">
                    {t.account.addPhoto}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        <Input
          label={t.account.titleLabel}
          labelPosition="top"
          name="title"
          defaultValue={listing.title}
          required
        />

        <FormSection
          title={t.account.marketplaceDetails}
          description={t.account.marketplaceDetailsSubtitle}
        />

        <div className="grid grid-cols-1 gap-4 small:grid-cols-[1fr_140px]">
          <Input
            label={t.account.price}
            labelPosition="top"
            name="price"
            type="number"
            min="1"
            defaultValue={amount ?? ""}
            required
          />
          <SelectField
            label={t.account.currency}
            name="currency_code"
            defaultValue={currencyCode}
          >
            <option value="khr">KHR</option>
            <option value="usd">USD</option>
          </SelectField>
        </div>
        <label className="flex items-center gap-3 rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-3 text-small-regular text-ui-fg-base">
          <input
            type="checkbox"
            name="negotiable"
            value="true"
            defaultChecked={listing.negotiable}
            className="h-4 w-4"
          />
          {t.account.priceNegotiable}
        </label>

        <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
          <SelectField
            label={t.account.farmingCategory}
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {t.store.categories[cat as keyof typeof t.store.categories] ??
                  cat}
              </option>
            ))}
          </SelectField>
          <SelectField
            label={t.account.province}
            name="location"
            defaultValue={listing.location ?? ""}
            required
          >
            <option value="" disabled>
              {t.account.selectProvince}
            </option>
            {LISTING_LOCATIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </SelectField>
          <Input
            label={t.account.district}
            labelPosition="top"
            name="district"
            defaultValue={listing.district ?? ""}
          />
          <Input
            label={t.account.quantity}
            labelPosition="top"
            name="quantity"
            defaultValue={listing.quantity ?? ""}
          />
          <Input
            label={t.account.unit}
            labelPosition="top"
            name="unit"
            defaultValue={listing.unit ?? ""}
          />
          <Input
            label={t.account.minimumOrder}
            labelPosition="top"
            name="minimum_order"
            defaultValue={listing.minimum_order ?? ""}
          />
          <SelectField
            label={t.account.condition}
            name="condition"
            defaultValue={listing.condition ?? ""}
          >
            <option value="">{t.account.notSpecified}</option>
            {LISTING_CONDITIONS.map((cond) => (
              <option key={cond} value={cond}>
                {t.store.conditionOptions[
                  cond as keyof typeof t.store.conditionOptions
                ] ?? cond}
              </option>
            ))}
          </SelectField>
          <SelectField
            label={t.account.availability}
            name="availability"
            defaultValue={listing.availability ?? ""}
          >
            <option value="">{t.account.notSpecified}</option>
            {LISTING_AVAILABILITY_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </SelectField>
          <SelectField
            label={t.account.productionMethod}
            name="production_method"
            defaultValue={listing.production_method ?? ""}
          >
            <option value="">{t.account.notSpecified}</option>
            {LISTING_PRODUCTION_METHODS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </SelectField>
          <SelectField
            label={t.account.preferredContact}
            name="contact_preference"
            defaultValue={listing.contact_preference ?? ""}
          >
            <option value="">{t.account.useProfilePreference}</option>
            {LISTING_CONTACT_PREFERENCES.map((value) => (
              <option key={value} value={value}>
                {value === "telegram"
                  ? t.account.contactTelegram
                  : value === "messenger"
                  ? t.account.contactMessenger
                  : t.account.contactPhone}
              </option>
            ))}
          </SelectField>
        </div>

        <CategoryGuidance category={category} t={t} />

        <CategorySpecificFields />

        <RichTextEditor
          label={t.common.description}
          name="description"
          defaultValue={listing.description}
          required
        />

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-small-regular text-ui-fg-subtle">
          {t.account.editDraftDetails}
        </div>

        <SubmitButton data-testid="update-listing-button">
          {t.account.saveChanges}
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

const SelectField = ({
  label,
  children,
  required,
  ...props
}: SelectFieldProps) => (
  <label className="flex w-full flex-col gap-2 text-small-regular text-ui-fg-subtle">
    <span className="text-small-semi text-ui-fg-base">
      {label}
      {required && <span className="text-rose-500">*</span>}
    </span>
    <select {...props} required={required} className={selectFieldClassName}>
      {children}
    </select>
  </label>
)

const CategoryGuidance = ({ category, t }: { category: string; t: any }) => (
  <div className="rounded-md border border-gray-200 bg-white p-4 text-small-regular text-ui-fg-subtle">
    <span className="font-semibold text-ui-fg-base">
      {t.store.categories[category as keyof typeof t.store.categories] ??
        category}{" "}
      {t.account.marketplaceDetails}:{" "}
    </span>
    {t.account.categoryGuidance[
      category as keyof typeof t.account.categoryGuidance
    ] ?? t.account.categoryGuidance.Other}
  </div>
)

const CategorySpecificFields = () => {
  return null
}

const getListingImages = (listing: SellerListing) =>
  Array.from(
    new Set([listing.thumbnail, ...(listing.image_urls ?? [])])
  ).filter(Boolean) as string[]

export default SellerListingEditor
