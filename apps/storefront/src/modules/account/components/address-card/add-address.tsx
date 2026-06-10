"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { addCustomerAddress } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import CountrySelect from "@modules/checkout/components/country-select"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const AddAddress = ({ region }: { region: HttpTypes.StoreRegion }) => {
  const router = useRouter()

  const [formState, formAction] = useActionState(addCustomerAddress, {
    success: false,
    error: null,
  } as { success: boolean; error: string | null })

  useEffect(() => {
    if (formState.success) {
      router.push("/account/addresses")
    }
  }, [formState.success, router])

  return (
    <form
      action={formAction}
      className="rounded-md border border-gray-200 bg-white p-5"
      data-testid="add-address-form"
    >
      <div className="grid grid-cols-1 gap-y-4">
        <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
          <Input
            label="First name"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
        </div>
        <Input
          label="Company"
          name="company"
          autoComplete="organization"
          data-testid="company-input"
        />
        <Input
          label="Address"
          name="address_1"
          required
          autoComplete="address-line1"
          data-testid="address-1-input"
        />
        <Input
          label="Apartment, suite, etc."
          name="address_2"
          autoComplete="address-line2"
          data-testid="address-2-input"
        />
        <div className="grid grid-cols-1 gap-4 small:grid-cols-[144px_1fr]">
          <Input
            label="Postal code"
            name="postal_code"
            required
            autoComplete="postal-code"
            data-testid="postal-code-input"
          />
          <Input
            label="City"
            name="city"
            required
            autoComplete="locality"
            data-testid="city-input"
          />
        </div>
        <Input
          label="Province / State"
          name="province"
          autoComplete="address-level1"
          data-testid="state-input"
        />
        <CountrySelect
          region={region}
          name="country_code"
          required
          autoComplete="country"
          data-testid="country-select"
        />
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
        <SubmitButton data-testid="save-button">Save address</SubmitButton>
        <LocalizedClientLink
          href="/account/addresses"
          className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 text-small-semi text-ui-fg-base transition-colors hover:bg-gray-50"
          data-testid="cancel-button"
        >
          Cancel
        </LocalizedClientLink>
      </div>
    </form>
  )
}

export default AddAddress
