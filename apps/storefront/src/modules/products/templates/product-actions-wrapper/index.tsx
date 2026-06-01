import { listProducts, retrieveProductSeller } from "@lib/data/products"
import { retrieveSavedListing } from "@lib/data/saved-listings"
import { HttpTypes } from "@medusajs/types"
import ListingInquiryForm from "@modules/products/components/listing-inquiry-form"
import ProductActions from "@modules/products/components/product-actions"
import SaveListingButton from "@modules/products/components/save-listing-button"

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
  const [product, seller, savedListing] = await Promise.all([
    listProducts({
      queryParams: { id: [id] },
      regionId: region.id,
    }).then(({ response }) => response.products[0]),
    retrieveProductSeller(id),
    retrieveSavedListing(id),
  ])

  if (!product) {
    return null
  }

  return (
    <>
      <ProductActions product={product} region={region} seller={seller} />
      <SaveListingButton productId={product.id} savedListing={savedListing} />
      <ListingInquiryForm productId={product.id} />
    </>
  )
}
