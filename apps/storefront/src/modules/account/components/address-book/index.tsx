import React from "react"

import EditAddress from "../address-card/edit-address-modal"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MapPin from "@modules/common/icons/map-pin"

type AddressBookProps = {
  customer: HttpTypes.StoreCustomer
  region: HttpTypes.StoreRegion
}

const AddressBook: React.FC<AddressBookProps> = ({ customer, region }) => {
  const addresses = customer.addresses ?? []

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col gap-3 small:flex-row small:items-center small:justify-between">
        <h2 className="text-large-semi">Contact records</h2>
        <LocalizedClientLink
          href="/account/addresses/new"
          className="inline-flex h-10 items-center justify-center gap-x-2 rounded-md bg-ui-fg-base px-4 text-small-semi text-white transition-colors hover:bg-ui-fg-subtle"
        >
          <MapPin size={16} />
          Add
        </LocalizedClientLink>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-md border border-gray-200 bg-white p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4e8] text-ui-fg-base">
            <MapPin size={18} />
          </div>
          <h3 className="mt-4 text-base-semi text-ui-fg-base">
            No addresses yet
          </h3>
          <p className="mt-2 text-base-regular text-ui-fg-subtle">
            Add a pickup, delivery, or seller contact address.
          </p>
          <LocalizedClientLink
            href="/account/addresses/new"
            className="mt-4 inline-flex items-center gap-x-2 rounded-md bg-ui-fg-base px-4 py-2 text-small-semi text-white transition-colors hover:bg-ui-fg-subtle"
          >
            <MapPin size={16} />
            Add
          </LocalizedClientLink>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
          <table className="w-full min-w-[760px] text-left">
            <thead className="border-b border-gray-200 text-small-semi text-ui-fg-base">
              <tr>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Defaults</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {addresses.map((address) => (
                <tr key={address.id} className="align-top">
                  <td className="px-4 py-4">
                    <div className="text-base-semi text-ui-fg-base">
                      {address.first_name} {address.last_name}
                    </div>
                    {address.company && (
                      <div className="mt-1 text-small-regular text-ui-fg-subtle">
                        {address.company}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-small-regular text-ui-fg-subtle">
                    <div>{address.address_1}</div>
                    {address.address_2 && <div>{address.address_2}</div>}
                    <div>
                      {[address.postal_code, address.city]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                    <div>
                      {[address.province, address.country_code?.toUpperCase()]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-small-regular text-ui-fg-subtle">
                    {address.phone || "Not added"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex max-w-[180px] flex-wrap gap-2">
                      {address.is_default_shipping && (
                        <span className="inline-flex items-center gap-x-1 rounded-md bg-gray-100 px-2 py-1 text-small-regular text-ui-fg-subtle">
                          <CheckIcon />
                          Shipping
                        </span>
                      )}
                      {address.is_default_billing && (
                        <span className="inline-flex items-center gap-x-1 rounded-md bg-gray-100 px-2 py-1 text-small-regular text-ui-fg-subtle">
                          <CheckIcon />
                          Billing
                        </span>
                      )}
                      {!address.is_default_shipping &&
                        !address.is_default_billing && (
                          <span className="text-small-regular text-ui-fg-subtle">
                            None
                          </span>
                        )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <EditAddress
                      region={region}
                      address={address}
                      variant="table"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M16 6L8.5 13.5L4 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default AddressBook
