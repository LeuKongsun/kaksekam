import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import type { StoreProductWithListing } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: StoreProductWithListing
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  const { cheapestPrice } = getProductPrice({
    product,
  })
  const listingDetails = [
    product.listing?.location,
    product.listing?.quantity && product.listing?.unit
      ? `${product.listing.quantity} ${product.listing.unit}`
      : product.listing?.quantity,
    product.listing?.condition,
    product.listing?.availability,
  ].filter(Boolean)
  const secondaryDetails = [
    product.listing?.variety,
    product.listing?.production_method,
    product.listing?.breed,
    product.listing?.brand,
    product.listing?.service_area,
  ].filter(Boolean)

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div
        className="group relative h-full overflow-hidden rounded-md border border-gray-200 bg-white transition-colors hover:border-gray-400"
        data-testid="product-wrapper"
      >
        {product.listing?.category && (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-white/95 px-3 py-1 text-small-semi text-ui-fg-base shadow-sm backdrop-blur">
            {product.listing.category}
          </div>
        )}
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="wide"
          isFeatured={isFeatured}
          className="rounded-none p-0 shadow-none"
        />
        <div className="flex min-h-[168px] flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-x-3">
            <Text
              className="line-clamp-2 text-base-semi text-ui-fg-base small:text-[15px]"
              data-testid="product-title"
            >
              {product.title}
            </Text>
            <span className="min-w-fit rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium uppercase text-green-700">
              Active
            </span>
          </div>
          {listingDetails.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {listingDetails.slice(0, 4).map((detail) => (
                <span
                  key={detail}
                  className="rounded-full bg-gray-100 px-2 py-1 text-small-regular text-ui-fg-subtle"
                >
                  {detail}
                </span>
              ))}
            </div>
          )}
          {product.description && (
            <p className="line-clamp-2 text-small-regular text-ui-fg-subtle">
              {product.description}
            </p>
          )}
          {secondaryDetails.length > 0 && (
            <p className="line-clamp-1 text-small-regular text-ui-fg-subtle">
              {secondaryDetails.join(" · ")}
            </p>
          )}
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
            <span className="min-w-fit text-small-semi text-ui-fg-base">
              View listing
            </span>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
