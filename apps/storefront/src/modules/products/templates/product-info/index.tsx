import React from "react"
import type { StoreProductWithListing } from "@lib/data/products"
import { Heading, Text } from "@modules/common/components/ui"

type ProductInfoProps = {
  product: StoreProductWithListing
  actions?: React.ReactNode
}

const ProductInfo = ({ product, actions }: ProductInfoProps) => {
  const listing = product.listing
  const listingDetails = [
    ["Category", listing?.category],
    ["Location", listing?.location],
    ["Availability", listing?.availability],
    ["Condition", listing?.condition],
    ["Preferred contact", listing?.contact_preference],
  ].filter((row): row is [string, string] => Boolean(row[1]))
  const productDetails = [
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
  ].filter((row): row is [string, string] => Boolean(row[1]))
  const additionalDetails = [
    ["Breed", listing?.breed],
    ["Age", listing?.age],
    ["Sex", listing?.sex],
    ["Health notes", listing?.health_notes],
    ["Brand", listing?.brand],
    ["Model", listing?.equipment_model],
    ["Year", listing?.year],
    ["Pack size", listing?.pack_size],
    ["Expiry/production date", listing?.expiry_date],
  ].filter((row): row is [string, string] => Boolean(row[1]))

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4">
        <div>
          <span className="rounded-full bg-green-50 px-3 py-1 text-small-semi uppercase text-green-700">
            Active listing
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Heading
              level="h2"
              className="text-3xl leading-10 text-ui-fg-base"
              data-testid="product-title"
            >
              {product.title}
            </Heading>
          </div>
          {actions && <div className="shrink-0 pt-1">{actions}</div>}
        </div>

        {(listingDetails.length > 0 ||
          productDetails.length > 0 ||
          additionalDetails.length > 0) && (
          <div className="space-y-5 border-y border-ui-border-base py-5">
            {listingDetails.length > 0 && (
              <DetailGroup rows={listingDetails} />
            )}
            {productDetails.length > 0 && (
              <DetailGroup title="Product or service" rows={productDetails} />
            )}
            {additionalDetails.length > 0 && (
              <DetailGroup
                title="Livestock or equipment"
                rows={additionalDetails}
              />
            )}
          </div>
        )}

        <Text
          className="whitespace-pre-line text-medium text-ui-fg-subtle"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      </div>
    </div>
  )
}

const DetailGroup = ({
  title,
  rows,
}: {
  title?: string
  rows: Array<[string, string]>
}) => {
  return (
    <div>
      {title && (
        <h3 className="mb-3 text-small-semi uppercase text-ui-fg-subtle">
          {title}
        </h3>
      )}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 small:grid-cols-3 medium:grid-cols-5">
        {rows.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-small-regular text-ui-fg-muted">{label}</dt>
            <dd className="mt-1 break-words text-small-semi text-ui-fg-base">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default ProductInfo
