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
  ].filter(Boolean)

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div
        className="group relative h-full overflow-hidden bg-white"
        data-testid="product-wrapper"
      >
        <div className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-base-semi text-ui-fg-base shadow-sm backdrop-blur">
          +
        </div>
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="wide"
          isFeatured={isFeatured}
          className="rounded-large p-0 shadow-none"
        />
        <div className="mt-3 flex min-h-[96px] flex-col gap-1 px-0.5 pb-1">
          <div className="flex items-start justify-between gap-x-3">
            <Text
              className="line-clamp-1 text-base-semi text-ui-fg-base small:text-[15px]"
              data-testid="product-title"
            >
              {product.title}
            </Text>
            {product.listing?.category && (
              <span className="min-w-fit text-small-regular text-ui-fg-subtle">
                {product.listing.category}
              </span>
            )}
          </div>
          {listingDetails.length > 0 && (
            <p className="line-clamp-1 text-small-regular text-ui-fg-subtle">
              {listingDetails.join(" · ")}
            </p>
          )}
          {product.description && (
            <p className="line-clamp-1 text-small-regular text-ui-fg-subtle">
              {product.description}
            </p>
          )}
          <div className="mt-auto pt-1">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
