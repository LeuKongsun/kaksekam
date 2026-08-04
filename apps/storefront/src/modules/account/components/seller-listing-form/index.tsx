"use client"

import {
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
  LISTING_AVAILABILITY_OPTIONS,
  LISTING_CONTACT_PREFERENCES,
  LISTING_LOCATIONS,
  LISTING_PRODUCTION_METHODS,
} from "@lib/marketplace/listing-fields"
import { createSellerListing } from "@lib/data/seller-listings"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
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
import { useTranslation } from "@lib/i18n/context"

const categoryOptions = LISTING_CATEGORIES

const MAX_PHOTO_UPLOADS = 6
const MAX_PHOTO_FILE_SIZE = 5 * 1024 * 1024
const MAX_PHOTO_TOTAL_SIZE = 24 * 1024 * 1024
const selectFieldClassName =
  "h-11 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2.5 text-ui-fg-base hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active focus:outline-none"
const formatFileSize = (bytes: number) =>
  `${(bytes / 1024 / 1024).toFixed(bytes >= 1024 * 1024 ? 1 : 0)}MB`

const SellerListingForm = () => {
  const { t } = useTranslation()
  const [category, setCategory] = useState("Produce")
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [activeImageIndex, setActiveImageIndex] = useState(0)
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

    setImageFiles((currentFiles) => {
      const mergedFiles = [...currentFiles, ...selectedFiles].slice(
        0,
        MAX_PHOTO_UPLOADS
      )
      const totalSize = mergedFiles.reduce((sum, file) => sum + file.size, 0)

      if (totalSize > MAX_PHOTO_TOTAL_SIZE) {
        setImageError(
          `Selected photos are ${formatFileSize(
            totalSize
          )} total. Please keep uploads under ${formatFileSize(
            MAX_PHOTO_TOTAL_SIZE
          )}.`
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
        (_file, index) => index !== indexToRemove
      )

      syncImageInput(nextFiles)
      setActiveImageIndex((currentIndex) =>
        Math.max(
          0,
          Math.min(
            currentIndex > indexToRemove ? currentIndex - 1 : currentIndex,
            nextFiles.length - 1
          )
        )
      )

      return nextFiles
    })
  }

  return (
    <form
      action={formAction}
      className="rounded-md border border-gray-200 bg-white p-4"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-large-semi">{t.account.addProduct}</h2>
        <LocalizedClientLink
          href="/account/listings"
          className="inline-flex h-9 items-center justify-center rounded-md border border-gray-300 px-3 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base"
        >
          {t.common.back}
        </LocalizedClientLink>
      </div>

      {state.success && (
        <div className="mb-4 rounded-md bg-green-50 px-3 py-2 text-small-regular text-green-700">
          {t.account.createProductSuccess}
        </div>
      )}
      {state.error && (
        <div className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-small-regular text-rose-700">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <FormSection
          title={t.account.photos}
          description={t.account.photosSubtitle}
        />

        <div className="flex flex-col gap-y-3 text-small-regular text-ui-fg-subtle">
          <div className="flex items-center justify-between gap-3">
            <span>{t.account.uploadPhotos}</span>
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
            required
            onChange={handleImageChange}
            className="sr-only"
          />
          <div className="relative aspect-video w-full overflow-hidden rounded-md border border-ui-border-base bg-ui-bg-subtle">
            {imagePreviews[activeImageIndex] ? (
              <div
                role="img"
                aria-label={`Selected photo ${activeImageIndex + 1}`}
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${imagePreviews[activeImageIndex]})`,
                }}
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
                  {t.account.photosSubtitle}
                </span>
              </button>
            )}

            {imagePreviews[activeImageIndex] && (
              <div className="absolute right-3 top-3 flex items-center gap-2">
                {imageFiles.length < MAX_PHOTO_UPLOADS && (
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
                  aria-label={`Remove photo ${activeImageIndex + 1}`}
                  onClick={() => removeImage(activeImageIndex)}
                  className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-ui-fg-subtle shadow-elevation-card-rest transition-colors hover:text-ui-fg-base focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2"
                >
                  <XMarkMini />
                </button>
              </div>
            )}
          </div>

          {imagePreviews.length > 0 && (
            <div
              className="no-scrollbar flex gap-2 overflow-x-auto pb-1"
              aria-label="Choose listing photo"
            >
              {imagePreviews.map((preview, index) => (
                <button
                  type="button"
                  key={`${imageFiles[index]?.name ?? "photo"}-${index}`}
                  onClick={() => setActiveImageIndex(index)}
                  aria-label={`Show selected photo ${index + 1}`}
                  aria-current={activeImageIndex === index}
                  className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-md border bg-ui-bg-subtle transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 ${
                    activeImageIndex === index
                      ? "border-ui-fg-base"
                      : "border-ui-border-base hover:border-ui-fg-subtle"
                  }`}
                >
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${preview})` }}
                  />
                </button>
              ))}
              {imageFiles.length < MAX_PHOTO_UPLOADS && (
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
            required
          />
          <SelectField
            label={t.account.currency}
            name="currency_code"
            defaultValue="khr"
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
            defaultValue=""
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
          />
          <Input
            label={t.account.quantity}
            labelPosition="top"
            name="quantity"
          />
          <Input label={t.account.unit} labelPosition="top" name="unit" />
          <Input
            label={t.account.minimumOrder}
            labelPosition="top"
            name="minimum_order"
          />
          <SelectField
            label={t.account.condition}
            name="condition"
            defaultValue=""
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
            defaultValue=""
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
            defaultValue=""
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
            defaultValue=""
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
          required
        />

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-small-regular text-ui-fg-subtle">
          {t.account.draftDetails}
        </div>

        <SubmitButton data-testid="create-listing-button">
          {t.account.submitReview}
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

export default SellerListingForm
