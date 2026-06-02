"use client"

import {
  markSellerListingSold,
  SellerListing,
  updateSellerListing,
  withdrawSellerListing,
} from "@lib/data/seller-listings"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { Button } from "@modules/common/components/ui"
import { useRouter } from "next/navigation"
import { useActionState, useState, useTransition } from "react"

type SellerListingEditorProps = {
  listing: SellerListing
}

const editableStatuses = new Set<SellerListing["status"]>([
  "draft",
  "pending_review",
  "active",
  "rejected",
])

const withdrawableStatuses = new Set<SellerListing["status"]>([
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
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [category, setCategory] = useState(listing.category ?? "Produce")
  const [withdrawError, setWithdrawError] = useState<string | null>(null)
  const [soldError, setSoldError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isMarkingSold, startSoldTransition] = useTransition()
  const [state, formAction] = useActionState(
    updateSellerListing.bind(null, listing.id),
    {
      success: false,
      error: null as string | null,
    }
  )
  const canEdit = editableStatuses.has(listing.status)
  const canWithdraw = withdrawableStatuses.has(listing.status)
  const canMarkSold = listing.status === "active"
  const amount = listing.price?.calculated_amount
  const currencyCode = listing.price?.currency_code ?? "eur"

  const withdraw = () => {
    setWithdrawError(null)

    startTransition(async () => {
      const result = await withdrawSellerListing(listing.id)

      if (!result.success) {
        setWithdrawError(result.error)
        return
      }

      router.refresh()
    })
  }

  const markSold = () => {
    setSoldError(null)

    startSoldTransition(async () => {
      const result = await markSellerListingSold(listing.id)

      if (!result.success) {
        setSoldError(result.error)
        return
      }

      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex flex-wrap gap-2 small:justify-end">
        <Button
          type="button"
          variant="secondary"
          size="small"
          disabled={!canEdit}
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? "Close edit" : "Edit"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="small"
          disabled={!canWithdraw}
          isLoading={isPending}
          onClick={withdraw}
        >
          Withdraw
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="small"
          disabled={!canMarkSold}
          isLoading={isMarkingSold}
          onClick={markSold}
        >
          Mark sold
        </Button>
      </div>

      {withdrawError && (
        <p className="text-small-regular text-rose-600">{withdrawError}</p>
      )}
      {soldError && (
        <p className="text-small-regular text-rose-600">{soldError}</p>
      )}

      {isOpen && canEdit && (
        <form
          action={formAction}
          className="rounded-md border border-gray-200 p-4 text-left"
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

            <CategorySpecificFields listing={listing} category={category} />

            <SubmitButton data-testid="update-listing-button">
              Save changes
            </SubmitButton>
          </div>
        </form>
      )}
    </div>
  )
}

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
