"use client"

import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@lib/data/customer"
import useToggleState from "@lib/hooks/use-toggle-state"
import { PencilSquare as Edit, Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"
import { Button, Heading, Text, clx } from "@modules/common/components/ui"
import Spinner from "@modules/common/icons/spinner"
import React, { useActionState, useEffect, useState } from "react"

type EditAddressProps = {
  region: HttpTypes.StoreRegion
  address: HttpTypes.StoreCustomerAddress
  isActive?: boolean
  variant?: "card" | "table"
}

const EditAddress: React.FC<EditAddressProps> = ({
  region,
  address,
  isActive = false,
  variant = "card",
}) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(updateCustomerAddress, {
    success: false,
    error: null,
  } as { success: boolean; error: string | null })

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
  }

  const actions = (
    <div className="flex items-center justify-end gap-x-4">
      <button
        className="inline-flex items-center gap-x-2 text-small-regular text-ui-fg-base hover:text-ui-fg-interactive"
        onClick={open}
        data-testid="address-edit-button"
      >
        <Edit />
        Edit
      </button>
      <button
        className="inline-flex items-center gap-x-2 text-small-regular text-ui-fg-base hover:text-rose-600"
        onClick={removeAddress}
        data-testid="address-delete-button"
      >
        {removing ? <Spinner /> : <Trash />}
        Remove
      </button>
    </div>
  )

  return (
    <>
      {variant === "card" ? (
        <div
          className={clx(
            "border rounded-rounded p-5 min-h-[220px] h-full w-full flex flex-col justify-between transition-colors",
            {
              "border-gray-900": isActive,
            }
          )}
          data-testid="address-container"
        >
          <div className="flex flex-col">
            <Heading
              className="text-left text-base-semi"
              data-testid="address-name"
            >
              {address.first_name} {address.last_name}
            </Heading>
            {address.company && (
              <Text
                className="txt-compact-small text-ui-fg-base"
                data-testid="address-company"
              >
                {address.company}
              </Text>
            )}
            <Text className="flex flex-col text-left text-base-regular mt-2">
              <span data-testid="address-address">
                {address.address_1}
                {address.address_2 && <span>, {address.address_2}</span>}
              </span>
              <span data-testid="address-postal-city">
                {address.postal_code}, {address.city}
              </span>
              <span data-testid="address-province-country">
                {address.province && `${address.province}, `}
                {address.country_code?.toUpperCase()}
              </span>
            </Text>
          </div>
          {actions}
        </div>
      ) : (
        actions
      )}

      <Modal isOpen={state} close={close} data-testid="edit-address-modal">
        <Modal.Title>
          <Heading className="mb-2">Edit location</Heading>
        </Modal.Title>
        <form action={formAction}>
          <input type="hidden" name="addressId" value={address.id} />
          <input type="hidden" name="first_name" value={address.first_name || "Contact"} />
          <input type="hidden" name="last_name" value={address.last_name || "Location"} />
          <input type="hidden" name="company" value="" />
          <input type="hidden" name="address_2" value={address.address_2 || ""} />
          <input type="hidden" name="postal_code" value={address.postal_code || "00000"} />
          <input
            type="hidden"
            name="country_code"
            value={address.country_code || region.countries?.[0]?.iso_2 || ""}
          />
          <Modal.Body>
            <div className="grid grid-cols-1 gap-y-2">
              <Input
                label="Address or pickup place"
                name="address_1"
                required
                autoComplete="address-line1"
                defaultValue={address.address_1 || undefined}
                data-testid="address-1-input"
              />
              <div className="grid grid-cols-1 gap-2 small:grid-cols-2">
                <Input
                  label="City or district"
                  name="city"
                  required
                  autoComplete="locality"
                  defaultValue={address.city || undefined}
                  data-testid="city-input"
                />
                <Input
                  label="Province"
                  name="province"
                  autoComplete="address-level1"
                  defaultValue={address.province || undefined}
                  data-testid="state-input"
                />
              </div>
              <Input
                label="Phone"
                name="phone"
                autoComplete="phone"
                defaultValue={address.phone || undefined}
                data-testid="phone-input"
              />
            </div>
            {formState.error && (
              <div className="text-rose-500 text-small-regular py-2">
                {formState.error}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-6">
              <Button
                type="reset"
                variant="secondary"
                onClick={close}
                className="h-10"
                data-testid="cancel-button"
              >
                Cancel
              </Button>
              <SubmitButton data-testid="save-button">Save</SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default EditAddress
