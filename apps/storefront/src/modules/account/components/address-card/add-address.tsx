"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { addCustomerAddress } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const AddAddress = ({
  region,
  onCancel,
  onSuccess,
}: {
  region: HttpTypes.StoreRegion
  onCancel?: () => void
  onSuccess?: () => void
}) => {
  const router = useRouter()

  const [formState, formAction] = useActionState(addCustomerAddress, {
    success: false,
    error: null,
  } as { success: boolean; error: string | null })

  useEffect(() => {
    if (formState.success) {
      if (onSuccess) {
        router.refresh()
        onSuccess()
        return
      }

      router.push("/account/addresses")
    }
  }, [formState.success, onSuccess, router])

  return (
    <form
      action={formAction}
      className="rounded-md border border-gray-200 bg-white p-5"
      data-testid="add-address-form"
    >
      <input type="hidden" name="first_name" value="Contact" />
      <input type="hidden" name="last_name" value="Location" />
      <input type="hidden" name="company" value="" />
      <input type="hidden" name="address_2" value="" />
      <input type="hidden" name="postal_code" value="00000" />
      <input
        type="hidden"
        name="country_code"
        value={region.countries?.[0]?.iso_2 ?? ""}
      />
      <div className="grid grid-cols-1 gap-y-4">
        <Input
          label="Address or pickup place"
          name="address_1"
          required
          autoComplete="address-line1"
          data-testid="address-1-input"
        />
        <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
          <Input
            label="City or district"
            name="city"
            required
            autoComplete="locality"
            data-testid="city-input"
          />
          <Input
            label="Province"
            name="province"
            autoComplete="address-level1"
            data-testid="state-input"
          />
        </div>
        <Input
          label="Phone"
          name="phone"
          autoComplete="phone"
          data-testid="phone-input"
        />
      </div>
      {formState.error && (
        <div
          className="py-3 text-small-regular text-rose-500"
          data-testid="address-error"
        >
          {formState.error}
        </div>
      )}
      <div className="mt-6 flex flex-col gap-3 small:flex-row">
        <SubmitButton data-testid="save-button">Save location</SubmitButton>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 text-small-semi text-ui-fg-base transition-colors hover:bg-gray-50"
            data-testid="cancel-button"
          >
            Cancel
          </button>
        ) : (
          <LocalizedClientLink
            href="/account/addresses"
            className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 text-small-semi text-ui-fg-base transition-colors hover:bg-gray-50"
            data-testid="cancel-button"
          >
            Cancel
          </LocalizedClientLink>
        )}
      </div>
    </form>
  )
}

export default AddAddress
