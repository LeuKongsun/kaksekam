import React, { Suspense } from "react"

import type { StoreProductWithListing } from "@lib/data/products"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import CommentSection from "@modules/products/components/comment-section"
import ProductActionsSkeleton from "@modules/products/components/product-actions/skeleton"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import Link from "next/link"
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
    phone: string | null
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
          <ProductBreadcrumb product={product} countryCode={countryCode} />
          <ImageGallery
            images={images}
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
          <ProductInfo
            product={product}
          />
        </div>

        <div className="flex w-full flex-col gap-y-4 large:sticky large:top-24">
          <ProductOnboardingCta />
          <Suspense fallback={<ProductActionsSkeleton />}>
            <ProductActionsWrapper
              id={product.id}
              region={region}
              customer={customer}
            />
          </Suspense>
          <ProductTabs />
        </div>
      </div>
      <CommentSection
        productId={product.id}
        productTitle={product.title}
        countryCode={countryCode}
        customer={customer}
      />
      <div
        className="mx-auto mb-16 mt-4 w-full max-w-[1120px] small:mb-24 small:mt-6"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

import { getTranslations } from "@lib/i18n/server"

const ProductBreadcrumb = async ({
  product,
  countryCode,
}: {
  product: StoreProductWithListing
  countryCode: string
}) => {
  const { t } = await getTranslations()
  const crumbs = [
    { label: t.product.breadcrumbHome, href: `/${countryCode}` },
    { label: t.product.breadcrumbListings, href: `/${countryCode}` },
    product.listing?.category && {
      label:
        t.store.categories[
          product.listing.category as keyof typeof t.store.categories
        ] ?? product.listing.category,
      href: `/${countryCode}?category=${encodeURIComponent(
        product.listing.category
      )}`,
    },
  ].filter(Boolean) as Array<{ label: string; href: string }>

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-small-regular text-ui-fg-subtle"
    >
      {crumbs.map((crumb, index) => (
        <React.Fragment key={`${crumb.label}-${crumb.href}`}>
          {index > 0 && <span className="text-ui-fg-muted">/</span>}
          <Link href={crumb.href} className="hover:text-ui-fg-base">
            {crumb.label}
          </Link>
        </React.Fragment>
      ))}
      <span className="text-ui-fg-muted">/</span>
      <span className="line-clamp-1 text-ui-fg-base">{product.title}</span>
    </nav>
  )
}

export default ProductTemplate
