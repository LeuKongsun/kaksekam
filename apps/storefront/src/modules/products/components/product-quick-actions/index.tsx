"use client"

import type { SavedListing } from "@lib/data/saved-listings"
import SaveListingButton from "@modules/products/components/save-listing-button"
import ShareListingButton from "@modules/products/components/share-listing-button"

type ProductQuickActionsProps = {
  productId: string
  productHandle: string
  productTitle: string
  savedListing?: SavedListing | null
  canSave?: boolean
}

const ProductQuickActions = ({
  productId,
  productHandle,
  productTitle,
  savedListing = null,
  canSave = true,
}: ProductQuickActionsProps) => (
  <div className="flex items-center gap-2">
    {canSave && (
      <SaveListingButton
        productId={productId}
        savedListing={savedListing}
        variant="icon"
      />
    )}
    <ShareListingButton
      productHandle={productHandle}
      productTitle={productTitle}
    />
  </div>
)

export default ProductQuickActions
