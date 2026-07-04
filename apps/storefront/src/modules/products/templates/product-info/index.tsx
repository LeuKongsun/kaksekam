import type { StoreProductWithListing } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import RichTextContent from "@modules/common/components/rich-text-content"
import { Heading } from "@modules/common/components/ui"

type ProductInfoProps = {
  product: StoreProductWithListing
}

type ListingStatus = NonNullable<StoreProductWithListing["listing"]>["status"]

const statusBadges: Record<ListingStatus, { label: string; className: string }> =
  {
    active: {
      label: "Active listing",
      className: "bg-green-50 text-green-700",
    },
    sold: { label: "Sold", className: "bg-sky-50 text-sky-700" },
    expired: { label: "Expired", className: "bg-gray-100 text-gray-600" },
    pending_review: {
      label: "Pending review",
      className: "bg-amber-50 text-amber-700",
    },
    rejected: { label: "Not available", className: "bg-red-50 text-red-700" },
    draft: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  }

const ProductInfo = ({ product }: ProductInfoProps) => {
  const listing = product.listing
  const statusBadge = statusBadges[listing?.status ?? "active"]
  const { cheapestPrice } = getProductPrice({ product })
  const listingDetails = [
    ["Category", listing?.category],
    ["Location", listing?.location],
    ["Condition", listing?.condition],
    [
      "Quantity",
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
            className={`rounded-full px-3 py-1 text-small-semi uppercase ${statusBadge.className}`}
            data-testid="listing-status-badge"
          >
            {statusBadge.label}
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
              Contact seller for price
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
