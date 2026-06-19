"use client"

import { updateCustomerProfile } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"
import X from "@modules/common/icons/x"
import { useActionState, useEffect, useMemo, useState } from "react"

type AccountProfilePanelProps = {
  customer: HttpTypes.StoreCustomer
  regions: HttpTypes.StoreRegion[]
}

const AccountProfilePanel = ({
  customer,
  regions,
}: AccountProfilePanelProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [state, formAction] = useActionState(updateCustomerProfile, {
    success: false,
    error: null as string | null,
  })
  const billingAddress = customer.addresses?.find(
    (address) => address.is_default_billing
  )
  const countryOptions = useMemo(
    () =>
      regions
        .flatMap((region) => region.countries ?? [])
        .map((country) => ({
          value: country.iso_2,
          label: country.display_name,
        })),
    [regions]
  )

  useEffect(() => {
    if (state.success) {
      setIsEditing(false)
    }
  }, [state.success])

  const country =
    countryOptions.find(
      (option) => option.value === billingAddress?.country_code
    )?.label ?? billingAddress?.country_code?.toUpperCase()

  return (
    <>
      <section className="rounded-md border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-4 small:flex-row small:items-center small:justify-between">
          <div>
            <h2 className="text-large-semi text-ui-fg-base">Account profile</h2>
            <p className="mt-1 text-small-regular text-ui-fg-subtle">
              Your private account details and billing contact.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 px-4 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base"
          >
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 small:grid-cols-2">
          <InfoItem label="Name">
            {formatName(customer.first_name, customer.last_name)}
          </InfoItem>
          <InfoItem label="Email">{customer.email}</InfoItem>
          <InfoItem label="Phone">{customer.phone || "Not added"}</InfoItem>
          <InfoItem label="Billing address">
            {billingAddress ? (
              <span>
                {billingAddress.address_1}
                {billingAddress.address_2
                  ? `, ${billingAddress.address_2}`
                  : ""}
                , {billingAddress.city}
                {country ? `, ${country}` : ""}
              </span>
            ) : (
              "Not added"
            )}
          </InfoItem>
        </div>
      </section>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <form
            action={formAction}
            className="max-h-full w-full max-w-2xl overflow-hidden rounded-md bg-white shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-4">
              <div>
                <h2 className="text-large-semi text-ui-fg-base">
                  Edit profile
                </h2>
                <p className="mt-1 text-small-regular text-ui-fg-subtle">
                  Update your account and billing contact details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 text-ui-fg-base transition-colors hover:bg-gray-50"
                aria-label="Close profile editor"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-4">
              {state.error && (
                <div className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-small-regular text-rose-700">
                  {state.error}
                </div>
              )}

              <input
                type="hidden"
                name="addressId"
                value={billingAddress?.id ?? ""}
              />

              <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
                <Input
                  label="First name"
                  name="first_name"
                  defaultValue={customer.first_name ?? ""}
                  required
                />
                <Input
                  label="Last name"
                  name="last_name"
                  defaultValue={customer.last_name ?? ""}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  defaultValue={customer.email}
                  disabled
                />
                <Input
                  label="Phone"
                  name="phone"
                  defaultValue={customer.phone ?? ""}
                />
              </div>

              <div className="mt-5 border-t border-gray-200 pt-4">
                <h3 className="text-base-semi text-ui-fg-base">
                  Billing address
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-4 small:grid-cols-2">
                  <Input
                    label="Company"
                    name="company"
                    defaultValue={billingAddress?.company ?? ""}
                  />
                  <Input
                    label="Address"
                    name="address_1"
                    defaultValue={billingAddress?.address_1 ?? ""}
                  />
                  <Input
                    label="Apartment, suite, etc."
                    name="address_2"
                    defaultValue={billingAddress?.address_2 ?? ""}
                  />
                  <Input
                    label="City"
                    name="city"
                    defaultValue={billingAddress?.city ?? ""}
                  />
                  <Input
                    label="Postal code"
                    name="postal_code"
                    defaultValue={billingAddress?.postal_code ?? ""}
                  />
                  <Input
                    label="Province"
                    name="province"
                    defaultValue={billingAddress?.province ?? ""}
                  />
                  <NativeSelect
                    name="country_code"
                    defaultValue={billingAddress?.country_code ?? ""}
                  >
                    <option value="">Country</option>
                    {countryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-200 p-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 px-4 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base"
              >
                Cancel
              </button>
              <SubmitButton data-testid="save-profile-button">
                Save changes
              </SubmitButton>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

const InfoItem = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
    <div className="text-[11px] font-medium uppercase text-ui-fg-muted">
      {label}
    </div>
    <div className="mt-1 text-base-regular text-ui-fg-base">{children}</div>
  </div>
)

const formatName = (firstName?: string | null, lastName?: string | null) =>
  `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Not added"

export default AccountProfilePanel
