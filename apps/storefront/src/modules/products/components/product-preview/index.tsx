import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import type { StoreProductWithListing } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import ProductQuickActions from "../product-quick-actions"
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
  const secondaryDetails = [
    product.listing?.availability,
    product.listing?.condition,
  ].filter(Boolean)
  const cardDescription =
    product.description || secondaryDetails.slice(0, 2).join(" · ")
  const isMockProduct = product.id.startsWith("mock-product-")

  return (
    <div
      className="group relative h-full overflow-hidden rounded-md border border-gray-200 bg-white transition-colors hover:border-gray-400"
      data-testid="product-wrapper"
    >
      <div className="absolute right-3 top-3 z-20">
        <ProductQuickActions
          productId={product.id}
          productHandle={product.handle}
          productTitle={product.title}
          canSave={!isMockProduct}
        />
      </div>
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="block h-full"
      >
        {product.listing?.category && (
          <div className="absolute left-3 top-3 z-10 max-w-[calc(100%-112px)] truncate rounded-full bg-white/95 px-3 py-1 text-small-semi text-ui-fg-base shadow-sm">
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
        <div className="flex min-h-[128px] flex-col gap-1.5 p-2.5 small:min-h-[136px] small:gap-2 small:p-4">
          <Text
            className="line-clamp-2 text-small-semi text-ui-fg-base small:text-[15px]"
            data-testid="product-title"
          >
            {product.title}
          </Text>
          {listingDetails.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {listingDetails.slice(0, 2).map((detail) => (
                <span
                  key={detail}
                  className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[11px] leading-4 text-ui-fg-subtle small:px-2 small:text-small-regular"
                >
                  {detail}
                </span>
              ))}
            </div>
          )}
          {cardDescription && (
            <p className="line-clamp-1 text-[11px] leading-4 text-ui-fg-subtle small:text-small-regular">
              {cardDescription}
            </p>
          )}
          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
            <span className="min-w-fit text-small-semi text-ui-fg-base">
              View
            </span>
          </div>
        </div>
      </LocalizedClientLink>
    </div>
  )
}
