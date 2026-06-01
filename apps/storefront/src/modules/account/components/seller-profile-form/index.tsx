"use client"

import { updateAccountSellerProfile } from "@lib/data/seller-profile"
import type { ProductSeller } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type SellerProfileFormProps = {
  customer: HttpTypes.StoreCustomer
  seller: ProductSeller | null
}

const getDefaultName = (customer: HttpTypes.StoreCustomer) =>
  `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim() ||
  "Marketplace Seller"

const getDefaultHandle = (seller: ProductSeller | null, customerName: string) =>
  seller?.handle ??
  customerName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const SellerProfileForm = ({ customer, seller }: SellerProfileFormProps) => {
  const defaultName = seller?.display_name ?? getDefaultName(customer)
  const [state, formAction] = useActionState(updateAccountSellerProfile, {
    success: false,
    error: null as string | null,
  })

  return (
    <form
      action={formAction}
      className="rounded-md border border-gray-200 bg-white p-5"
    >
      {state.success && (
        <div className="mb-4 rounded-md bg-green-50 px-3 py-2 text-small-regular text-green-700">
          Seller profile saved.
        </div>
      )}
      {state.error && (
        <div className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-small-regular text-rose-700">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
        <Input
          label="Farm or business name"
          name="display_name"
          defaultValue={defaultName}
          required
        />
        <Input
          label="Handle"
          name="handle"
          defaultValue={getDefaultHandle(seller, defaultName)}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          defaultValue={seller?.email ?? customer.email}
        />
        <Input
          label="Phone"
          name="phone"
          defaultValue={seller?.phone ?? customer.phone ?? ""}
        />
        <Input
          label="Location"
          name="location"
          defaultValue={seller?.location ?? ""}
        />
      </div>

      <label className="mt-4 flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
        Bio
        <textarea
          name="bio"
          rows={5}
          defaultValue={seller?.bio ?? ""}
          placeholder="Tell buyers what you grow, supply, where you operate, and when you usually respond."
          className="w-full rounded-md border border-ui-border-base bg-ui-bg-field px-4 py-3 text-ui-fg-base outline-none hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active"
        />
      </label>

      <div className="mt-5">
        <SubmitButton data-testid="save-seller-profile-button">
          Save seller profile
        </SubmitButton>
      </div>
    </form>
  )
}

export default SellerProfileForm
