import { SellerListing } from "@lib/data/seller-listings"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Eye from "@modules/common/icons/eye"
import Package from "@modules/common/icons/package"
import { Pagination } from "@modules/store/components/pagination"
import SellerListingActions from "../seller-listing-actions"

type SellerListingsProps = {
  listings: SellerListing[]
  totalListings: number
  statusCounts: Record<SellerListing["status"], number>
  page: number
  pageSize: number
  totalPages: number
}

const statusLabels: Record<SellerListing["status"], string> = {
  draft: "Draft",
  pending_review: "Pending",
  active: "Active",
  sold: "Sold",
  rejected: "Rejected",
  expired: "Expired",
}

const statusMeta: Record<
  SellerListing["status"],
  {
    tone: string
  }
> = {
  draft: {
    tone: "border-gray-200 bg-gray-50 text-ui-fg-subtle",
  },
  pending_review: {
    tone: "border-amber-200 bg-amber-50 text-amber-800",
  },
  active: {
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  sold: {
    tone: "border-gray-200 bg-gray-50 text-ui-fg-subtle",
  },
  rejected: {
    tone: "border-rose-200 bg-rose-50 text-rose-700",
  },
  expired: {
    tone: "border-orange-200 bg-orange-50 text-orange-800",
  },
}

const formatListingDetails = (listing: SellerListing) =>
  [
    listing.category,
    listing.location,
    listing.quantity && listing.unit
      ? `${listing.quantity} ${listing.unit}`
      : listing.quantity,
    listing.availability,
    listing.condition,
    listing.variety,
    listing.production_method,
    listing.harvest_date,
    listing.breed,
    listing.age,
    listing.sex,
    listing.health_notes,
    listing.brand,
    listing.equipment_model,
    listing.year,
    listing.pack_size,
    listing.expiry_date,
    listing.service_area,
  ].filter(Boolean)

const formatPrice = (listing: SellerListing) => {
  if (!listing.price?.calculated_amount) {
    return "Price unavailable"
  }

  return `${listing.price.calculated_amount} ${(
    listing.price.currency_code ?? ""
  ).toUpperCase()}`
}

const SellerListings = ({
  listings,
  totalListings,
  statusCounts,
  page,
  pageSize,
  totalPages,
}: SellerListingsProps) => {
  const totalVisible = statusCounts.active
  const waitingOnReview = statusCounts.pending_review
  const needsAttention = statusCounts.rejected + statusCounts.expired
  const pageStart = totalListings === 0 ? 0 : (page - 1) * pageSize + 1
  const pageEnd = Math.min(page * pageSize, totalListings)

  return (
    <div className="w-full" data-testid="seller-listings-page-wrapper">
      <div className="mb-8">
        <div className="flex flex-col gap-3 small:flex-row small:items-center small:justify-between">
          <h1 className="text-2xl-semi">Product listing</h1>
          <LocalizedClientLink
            href="/account/listings/new"
            className="inline-flex h-10 items-center justify-center gap-x-2 rounded-md bg-ui-fg-base px-4 text-small-semi text-white transition-colors hover:bg-ui-fg-subtle"
          >
            <Package size={16} />
            Add new
          </LocalizedClientLink>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-y border-gray-200 py-3">
          <ListingSignal
            label="Total"
            value={totalListings}
          />
          <ListingSignal
            label="Visible"
            value={totalVisible}
          />
          <ListingSignal
            label="In review"
            value={waitingOnReview}
          />
          <ListingSignal
            label="Attention"
            value={needsAttention}
          />
        </div>
      </div>

      <div className="flex flex-col gap-y-3">
        <div>
          <h2 className="text-large-semi">Your listings</h2>
          <p className="mt-1 text-small-regular text-ui-fg-subtle">
            Showing {pageStart}-{pageEnd} of {totalListings} listings.
          </p>
        </div>
        {totalListings === 0 ? (
          <EmptyListings />
        ) : (
          <div>
            <ListingsTable listings={listings} startIndex={pageStart} />
            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                data-testid="seller-listings-pagination"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const EmptyListings = () => (
  <div className="rounded-md border border-dashed border-gray-300 bg-white p-6 shadow-sm">
    <div className="max-w-xl">
      <h3 className="text-large-semi text-ui-fg-base">
        Start with one good listing
      </h3>
      <p className="mt-2 text-base-regular text-ui-fg-subtle">
        Add photos, price, location, and availability. After approval, buyers
        can find it and send inquiries.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <LocalizedClientLink
          href="/account/listings/new"
          className="inline-flex h-10 items-center justify-center gap-x-2 rounded-md bg-ui-fg-base px-4 text-small-semi text-white transition-colors hover:bg-ui-fg-subtle"
        >
          <Package size={16} />
          Add listing
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/account/seller-profile"
          className="inline-flex h-10 items-center justify-center gap-x-2 rounded-md border border-gray-300 px-4 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base"
        >
          <ProfileIcon size={16} />
          Seller profile
        </LocalizedClientLink>
      </div>
    </div>
  </div>
)

const ListingSignal = ({
  label,
  value,
}: {
  label: string
  value: number
}) => (
  <div className="flex items-baseline gap-x-2">
    <span className="text-[11px] font-medium uppercase text-ui-fg-subtle">
      {label}
    </span>
    <span className="text-base-semi text-ui-fg-base">{value}</span>
  </div>
)

const ListingsTable = ({
  listings,
  startIndex,
}: {
  listings: SellerListing[]
  startIndex: number
}) => (
  <div className="w-full max-w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-left">
        <thead className="bg-ui-fg-base">
          <tr className="text-[11px] font-medium uppercase text-white">
            <th className="w-12 px-3 py-4">No.</th>
            <th className="w-[28%] px-3 py-4">Listing</th>
            <th className="w-[15%] px-3 py-4">Status</th>
            <th className="w-[13%] px-3 py-4">Price</th>
            <th className="w-[20%] px-3 py-4">Details</th>
            <th className="w-[24%] px-3 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {listings.map((listing, index) => (
            <ListingRow
              key={listing.id}
              listing={listing}
              rowNumber={startIndex + index}
            />
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const ListingRow = ({
  listing,
  rowNumber,
}: {
  listing: SellerListing
  rowNumber: number
}) => {
  const details = formatListingDetails(listing).slice(0, 4)
  const meta = statusMeta[listing.status]

  return (
    <tr className="align-middle hover:bg-gray-50/70">
      <td className="px-3 py-4 text-base-regular text-ui-fg-subtle">
        {rowNumber}
      </td>
      <td className="px-3 py-4 align-middle">
        <div className="flex min-w-0 gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-[#eef4e8]">
            {listing.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.thumbnail}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-2 text-center text-[11px] text-ui-fg-subtle">
                No photo
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-base-semi text-ui-fg-base">
              {listing.title}
            </div>
            <p className="mt-1 line-clamp-2 text-small-regular text-ui-fg-subtle">
              {listing.description || "No description added."}
            </p>
            {listing.status === "active" && (
              <LocalizedClientLink
                href={`/products/${listing.handle}`}
                className="mt-2 inline-flex items-center gap-x-1 text-small-semi text-ui-fg-base hover:text-ui-fg-interactive"
              >
                <Eye size={14} />
                Public page
              </LocalizedClientLink>
            )}
          </div>
        </div>
      </td>
      <td className="px-3 py-4">
        <span
          className={`inline-flex rounded-md border px-2.5 py-1 text-small-semi ${meta.tone}`}
        >
          {statusLabels[listing.status]}
        </span>
        {listing.status === "rejected" && listing.moderation_note && (
          <div className="mt-2 max-w-[220px] rounded-md border border-rose-200 bg-rose-50 p-2 text-small-regular text-rose-700">
            {listing.moderation_note}
          </div>
        )}
      </td>
      <td className="break-words px-3 py-4 text-base-semi text-ui-fg-base">
        {formatPrice(listing)}
      </td>
      <td className="px-3 py-4">
        {details.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {details.map((detail) => (
              <span
                key={detail}
                className="rounded-md bg-gray-100 px-2 py-1 text-small-regular text-ui-fg-subtle"
              >
                {detail}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-small-regular text-ui-fg-subtle">
            Add category, location, quantity, and availability.
          </div>
        )}
      </td>
      <td className="px-3 py-4">
        <div>
          <SellerListingActions listing={listing} />
        </div>
      </td>
    </tr>
  )
}

function ProfileIcon({
  size = 16,
  className,
}: {
  size?: string | number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 9.5C11.6569 9.5 13 8.15685 13 6.5C13 4.84315 11.6569 3.5 10 3.5C8.34315 3.5 7 4.84315 7 6.5C7 8.15685 8.34315 9.5 10 9.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4.5 16.5C4.5 13.7386 6.96243 11.5 10 11.5C13.0376 11.5 15.5 13.7386 15.5 16.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default SellerListings
