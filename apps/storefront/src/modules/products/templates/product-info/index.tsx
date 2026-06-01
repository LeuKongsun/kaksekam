import type { StoreProductWithListing } from "@lib/data/products"
import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: StoreProductWithListing
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const listingDetails = [
    product.listing?.category && ["Category", product.listing.category],
    product.listing?.location && ["Location", product.listing.location],
    product.listing?.quantity &&
      [
        "Quantity",
        product.listing.unit
          ? `${product.listing.quantity} ${product.listing.unit}`
          : product.listing.quantity,
      ],
    product.listing?.availability && ["Availability", product.listing.availability],
    product.listing?.condition && ["Condition", product.listing.condition],
    product.listing?.contact_preference && [
      "Preferred contact",
      product.listing.contact_preference,
    ],
  ].filter(Boolean) as string[][]

  return (
    <div id="product-info">
      <div className="mx-auto flex flex-col gap-y-4 lg:max-w-[500px]">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h2"
          className="text-3xl leading-10 text-ui-fg-base"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <Text
          className="whitespace-pre-line text-medium text-ui-fg-subtle"
          data-testid="product-description"
        >
          {product.description}
        </Text>
        {listingDetails.length > 0 && (
          <dl className="grid grid-cols-1 gap-3 rounded-md border border-gray-200 bg-white p-4 text-small-regular">
            {listingDetails.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-x-4">
                <dt className="text-ui-fg-subtle">{label}</dt>
                <dd className="text-right text-ui-fg-base">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  )
}

export default ProductInfo
