import { listProducts, retrieveProductSeller } from "@lib/data/products"
import { retrieveSavedListing } from "@lib/data/saved-listings"
import { HttpTypes } from "@medusajs/types"
import ListingInquiryForm from "@modules/products/components/listing-inquiry-form"
import ProductActions from "@modules/products/components/product-actions"
import ProductQuickActions from "@modules/products/components/product-quick-actions"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  const isMockProduct = id.startsWith("mock-product-")
  const [product, seller, savedListing] = await Promise.all([
    listProducts({
      queryParams: { id: [id] },
      regionId: region.id,
    }).then(({ response }) => response.products[0]),
    isMockProduct ? Promise.resolve(null) : retrieveProductSeller(id),
    isMockProduct ? Promise.resolve(null) : retrieveSavedListing(id),
  ])

  if (!product) {
    return null
  }

  return (
    <>
      <div className="flex justify-end">
        <ProductQuickActions
          productId={product.id}
          productHandle={product.handle}
          productTitle={product.title}
          savedListing={savedListing}
          canSave={!isMockProduct}
        />
      </div>
      <ProductActions product={product} region={region} seller={seller} />
      <ListingInquiryForm productId={product.id} />
    </>
  )
}
