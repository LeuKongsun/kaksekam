import type { StoreProductWithListing } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import RichTextContent from "@modules/common/components/rich-text-content"
import { Heading } from "@modules/common/components/ui"

type ProductInfoProps = {
  product: StoreProductWithListing
}

type ListingStatus = NonNullable<StoreProductWithListing["listing"]>["status"]

import { getTranslations } from "@lib/i18n/server"

const statusClasses: Record<ListingStatus, string> = {
  active: "bg-green-50 text-green-700",
  sold: "bg-sky-50 text-sky-700",
  expired: "bg-gray-100 text-gray-600",
  pending_review: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-700",
  draft: "bg-gray-100 text-gray-600",
}

const ProductInfo = async ({ product }: ProductInfoProps) => {
  const { t } = await getTranslations()
  const listing = product.listing
  const status = listing?.status ?? "active"
  const statusLabel = t.product.details[status]
  const statusClassName = statusClasses[status]
  const { cheapestPrice } = getProductPrice({ product })
  const listingDetails = [
    [
      t.product.details.category,
      listing?.category
        ? t.store.categories[
            listing.category as keyof typeof t.store.categories
          ] ?? listing.category
        : undefined,
    ],
    [t.product.details.location, listing?.location],
    [t.product.details.district, listing?.district],
    [
      t.product.details.condition,
      listing?.condition
        ? t.store.conditionOptions[
            listing.condition as keyof typeof t.store.conditionOptions
          ] ?? listing.condition
        : undefined,
    ],
    [t.product.details.minimumOrder, listing?.minimum_order],
    [t.product.details.availability, listing?.availability],
    [t.product.details.productionMethod, listing?.production_method],
    [
      t.product.details.preferredContact,
      listing?.contact_preference === "telegram"
        ? t.product.telegram
        : listing?.contact_preference === "messenger"
          ? t.product.messenger
          : listing?.contact_preference === "phone"
            ? t.product.call
            : undefined,
    ],
    [
      t.product.details.quantity,
      listing?.quantity && listing.unit
        ? `${listing.quantity} ${listing.unit}`
        : listing?.quantity,
    ],
  ].filter((row): row is [string, string] => Boolean(row[1]))

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4">
        <div>
          <span
            className={`rounded-full px-3 py-1 text-small-semi uppercase ${statusClassName}`}
            data-testid="listing-status-badge"
          >
            {statusLabel}
          </span>
        </div>
        <Heading
          level="h2"
          className="text-3xl-semi leading-tight text-ui-fg-base"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <div className="flex flex-wrap items-baseline gap-x-3">
          {cheapestPrice ? (
            <>
              {cheapestPrice.price_type === "sale" && (
                <span className="text-large-regular text-ui-fg-muted line-through">
                  {cheapestPrice.original_price}
                </span>
              )}
              <span
                className="text-2xl-semi text-brand"
                data-testid="product-price"
              >
                {cheapestPrice.calculated_price}
              </span>
              {listing?.negotiable && (
                <span className="rounded-full bg-amber-50 px-2 py-1 text-xsmall-semi text-amber-800">
                  {t.product.details.negotiable}
                </span>
              )}
              {listing?.quantity && listing.unit && (
                <span className="text-base-regular text-ui-fg-subtle">
                  {listing.quantity} {listing.unit}
                </span>
              )}
            </>
          ) : (
            <span
              className="text-large-semi text-ui-fg-base"
              data-testid="product-price"
            >
              {t.product.details.contactForPrice}
            </span>
          )}
        </div>

        {listingDetails.length > 0 && (
          <div className="space-y-5 border-y border-ui-border-base py-5">
            <DetailGroup rows={listingDetails} />
          </div>
        )}

        <RichTextContent
          content={product.description}
          className="prose prose-sm max-w-none whitespace-pre-line text-medium text-ui-fg-subtle [&_a]:text-ui-fg-interactive [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          data-testid="product-description"
        />
      </div>
    </div>
  )
}

const DetailGroup = ({
  title,
  rows,
}: {
  title?: string
  rows: Array<[string, string]>
}) => {
  return (
    <div>
      {title && (
        <h3 className="mb-3 text-small-semi uppercase text-ui-fg-subtle">
          {title}
        </h3>
      )}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 small:grid-cols-3 medium:grid-cols-5">
        {rows.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-small-regular text-ui-fg-muted">{label}</dt>
            <dd className="mt-1 break-words text-small-semi text-ui-fg-base">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default ProductInfo
