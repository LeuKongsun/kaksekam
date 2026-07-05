"use client"

import AddAddress from "../address-card/add-address"
import EditAddress from "../address-card/edit-address-modal"
import { HttpTypes } from "@medusajs/types"
import MapPin from "@modules/common/icons/map-pin"
import X from "@modules/common/icons/x"
import React, { useState } from "react"

type AddressBookProps = {
  customer: HttpTypes.StoreCustomer
  region: HttpTypes.StoreRegion
}

const AddressBook: React.FC<AddressBookProps> = ({ customer, region }) => {
  const addresses = customer.addresses ?? []
  const [isAddingLocation, setIsAddingLocation] = useState(false)

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col gap-3 small:flex-row small:items-center small:justify-between">
        <h2 className="text-large-semi">Locations</h2>
        {addresses.length === 0 && (
          <button
            type="button"
            onClick={() => setIsAddingLocation(true)}
            className="inline-flex h-10 items-center justify-center gap-x-2 rounded-md bg-ui-fg-base px-4 text-small-semi text-white transition-colors hover:bg-ui-fg-subtle"
          >
            <MapPin size={16} />
            Add location
          </button>
        )}
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-md border border-gray-200 bg-white p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4e8] text-ui-fg-base">
            <MapPin size={18} />
          </div>
          <h3 className="mt-4 text-base-semi text-ui-fg-base">
            No locations yet
          </h3>
          <p className="mt-2 text-base-regular text-ui-fg-subtle">
            Add a pickup place, farm location, or contact point.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 small:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-md border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-base-semi text-ui-fg-base">
                    {address.address_1 || "Saved location"}
                  </div>
                  <div className="mt-1 text-small-regular text-ui-fg-subtle">
                    {[address.city, address.province]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                  {address.phone && (
                    <div className="mt-2 text-small-regular text-ui-fg-base">
                      {address.phone}
                    </div>
                  )}
                </div>
                <EditAddress region={region} address={address} variant="table" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddingLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="max-h-full w-full max-w-xl overflow-hidden rounded-md bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-4">
              <div>
                <h3 className="text-large-semi text-ui-fg-base">
                  Add location
                </h3>
                <p className="mt-1 text-small-regular text-ui-fg-subtle">
                  Save a pickup place, farm location, or contact point.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingLocation(false)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 text-ui-fg-base transition-colors hover:bg-gray-50"
                aria-label="Close add location"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto">
              <AddAddress
                region={region}
                onCancel={() => setIsAddingLocation(false)}
                onSuccess={() => setIsAddingLocation(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddressBook
