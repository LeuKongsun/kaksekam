import React from "react"
import type { StoreProductWithListing } from "@lib/data/products"
import { Heading, Text } from "@modules/common/components/ui"

type ProductInfoProps = {
  product: StoreProductWithListing
  actions?: React.ReactNode
}

const ProductInfo = ({ product, actions }: ProductInfoProps) => {
  const heroDetails = [
    product.listing?.category,
    product.listing?.location,
    product.listing?.availability,
  ].filter(Boolean)

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-green-50 px-3 py-1 text-small-semi uppercase text-green-700">
            Active listing
          </span>
          {heroDetails.map((detail) => (
            <span
              key={detail}
              className="rounded-full bg-gray-100 px-3 py-1 text-small-regular text-ui-fg-subtle"
            >
              {detail}
            </span>
          ))}
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {product.listing?.location && (
              <Text className="text-small-regular text-ui-fg-subtle">
                Listed in {product.listing.location}
              </Text>
            )}
            <Heading
              level="h2"
              className="mt-1 text-3xl leading-10 text-ui-fg-base"
              data-testid="product-title"
            >
              {product.title}
            </Heading>
          </div>
          {actions && <div className="shrink-0 pt-1">{actions}</div>}
        </div>

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

export default ProductInfo
