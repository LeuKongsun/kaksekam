import React, { Suspense } from "react"

import type { StoreProductWithListing } from "@lib/data/products"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import CommentSection from "@modules/products/components/comment-section"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"
import ProductQuickActionsWrapper from "./product-quick-actions-wrapper"

type ProductTemplateProps = {
  product: StoreProductWithListing
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
  customer: {
    id: string
    name: string
    email: string
  } | null
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
  customer,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div
        className="mx-auto grid w-full max-w-[1120px] grid-cols-1 gap-8 py-8 large:grid-cols-[minmax(0,1.1fr)_360px] large:items-start"
        data-testid="product-container"
      >
        <div className="flex min-w-0 flex-col gap-y-6">
          <ProductInfo
            product={product}
            actions={
              <Suspense fallback={null}>
                <ProductQuickActionsWrapper
                  productId={product.id}
                  productHandle={product.handle}
                  productTitle={product.title}
                />
              </Suspense>
            }
          />
          <ImageGallery images={images} />
        </div>

        <div className="flex w-full flex-col gap-y-4 large:sticky large:top-24">
          <ProductOnboardingCta />
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                productId={product.id}
                region={region}
              />
            }
          >
            <ProductActionsWrapper id={product.id} region={region} />
          </Suspense>
          <ProductTabs product={product} />
        </div>
      </div>
      <CommentSection
        productId={product.id}
        productTitle={product.title}
        countryCode={countryCode}
        customer={customer}
      />
      <div
        className="mx-auto my-16 w-full max-w-[1120px] small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
