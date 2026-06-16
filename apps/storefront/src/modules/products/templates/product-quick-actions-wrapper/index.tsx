import { retrieveSavedListing } from "@lib/data/saved-listings"
import ProductQuickActions from "@modules/products/components/product-quick-actions"

type ProductQuickActionsWrapperProps = {
  productId: string
  productHandle: string
  productTitle: string
}

export default async function ProductQuickActionsWrapper({
  productId,
  productHandle,
  productTitle,
}: ProductQuickActionsWrapperProps) {
  const isMockProduct = productId.startsWith("mock-product-")
  const savedListing = isMockProduct
    ? null
    : await retrieveSavedListing(productId)

  return (
    <ProductQuickActions
      productId={productId}
      productHandle={productHandle}
      productTitle={productTitle}
      savedListing={savedListing}
      canSave={!isMockProduct}
    />
  )
}
