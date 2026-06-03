"use client"

import Accordion from "./accordion"
import type { StoreProductWithListing } from "@lib/data/products"

type ProductTabsProps = {
  product: StoreProductWithListing
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Listing details",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "How to arrange",
      component: <ContactInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  const listing = product.listing
  const listingGroups = [
    {
      title: "Listing",
      rows: [
        ["Category", listing?.category],
        ["Location", listing?.location],
        ["Availability", listing?.availability],
        ["Condition", listing?.condition],
        ["Preferred contact", listing?.contact_preference],
      ],
    },
    {
      title: "Product or service",
      rows: [
        [
          "Quantity",
          listing?.quantity && listing.unit
            ? `${listing.quantity} ${listing.unit}`
            : listing?.quantity,
        ],
        ["Variety/type", listing?.variety],
        ["Production method", listing?.production_method],
        ["Harvest/season", listing?.harvest_date],
        ["Service area", listing?.service_area],
      ],
    },
    {
      title: "Livestock or equipment",
      rows: [
        ["Breed", listing?.breed],
        ["Age", listing?.age],
        ["Sex", listing?.sex],
        ["Health notes", listing?.health_notes],
        ["Brand", listing?.brand],
        ["Model", listing?.equipment_model],
        ["Year", listing?.year],
        ["Pack size", listing?.pack_size],
        ["Expiry/production date", listing?.expiry_date],
      ],
    },
  ]

  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-6">
        {listingGroups.map((group) => {
          const rows = group.rows.filter((row): row is [string, string] =>
            Boolean(row[1])
          )

          if (!rows.length) {
            return null
          }

          return (
            <div key={group.title}>
              <span className="font-semibold">{group.title}</span>
              <dl className="mt-3 grid grid-cols-1 gap-3 small:grid-cols-2">
                {rows.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-ui-fg-subtle">{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )
        })}
        {!listing && (
          <div>
            <span className="font-semibold">Listing details</span>
            <p className="mt-2 max-w-sm text-ui-fg-subtle">
              Details are unavailable for this listing.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const ContactInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-6">
        <div>
          <span className="font-semibold">Contact the seller</span>
          <p className="max-w-sm">
            Ask questions, confirm the listing is still available, and arrange
            inspection details directly with the seller.
          </p>
        </div>
        <div>
          <span className="font-semibold">Arrange privately</span>
          <p className="max-w-sm">
            Payment, pickup, delivery, and handover are arranged between buyer
            and seller outside this platform.
          </p>
        </div>
        <div>
          <span className="font-semibold">Stay safe</span>
          <p className="max-w-sm">
            Meet in a safe place, check the item carefully, and avoid sending
            money before you are comfortable with the arrangement.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
