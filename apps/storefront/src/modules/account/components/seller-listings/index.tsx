import { SellerListing } from "@lib/data/seller-listings"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SellerListingEditor from "../seller-listing-editor"
import SellerListingForm from "../seller-listing-form"

type SellerListingsProps = {
  listings: SellerListing[]
}

const statusLabels: Record<SellerListing["status"], string> = {
  draft: "Draft",
  pending_review: "Pending review",
  active: "Active",
  sold: "Sold",
  rejected: "Rejected",
  expired: "Expired",
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

const formatReviewedAt = (value: string | null) => {
  if (!value) {
    return null
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

const SellerListings = ({ listings }: SellerListingsProps) => {
  const statusCounts = listings.reduce(
    (counts, listing) => ({
      ...counts,
      [listing.status]: counts[listing.status] + 1,
    }),
    {
      draft: 0,
      pending_review: 0,
      active: 0,
      sold: 0,
      rejected: 0,
      expired: 0,
    } satisfies Record<SellerListing["status"], number>
  )

  return (
    <div className="w-full" data-testid="seller-listings-page-wrapper">
      <div className="mb-8">
        <div className="grid grid-cols-1 gap-4 small:grid-cols-[1fr_auto]">
          <div>
            <h1 className="text-2xl-semi">My listings</h1>
            <p className="mt-2 max-w-2xl text-base-regular text-ui-fg-subtle">
              Create marketplace listings, track review status, and keep buyers
              moving toward an inquiry.
            </p>
          </div>
          <LocalizedClientLink
            href="/account/seller-profile"
            className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 px-4 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base"
          >
            Seller profile
          </LocalizedClientLink>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 small:grid-cols-4">
          <ListingSignal label="Active" value={statusCounts.active} />
          <ListingSignal label="In review" value={statusCounts.pending_review} />
          <ListingSignal label="Drafts" value={statusCounts.draft} />
          <ListingSignal
            label="Needs attention"
            value={statusCounts.rejected + statusCounts.expired}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <SellerListingForm />

        <div className="flex flex-col gap-y-3">
          <h2 className="text-large-semi">Your listings</h2>
          {listings.length === 0 ? (
            <div className="rounded-md border border-gray-200 p-4 text-base-regular text-ui-fg-subtle">
              No listings yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="grid grid-cols-1 gap-3 p-4 small:grid-cols-[96px_1fr_auto]"
                >
                  <div className="aspect-square overflow-hidden rounded-md bg-gray-100">
                    {listing.thumbnail && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listing.thumbnail}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-base-semi">{listing.title}</div>
                      <span className="inline-flex rounded-md border border-gray-200 px-2 py-1 text-small-regular">
                        {statusLabels[listing.status]}
                      </span>
                    </div>
                    {listing.description && (
                      <p className="mt-1 line-clamp-2 text-small-regular text-ui-fg-subtle">
                        {listing.description}
                      </p>
                    )}
                    <div className="mt-2 text-small-regular text-ui-fg-subtle">
                      {listing.price?.calculated_amount
                        ? `${listing.price.calculated_amount} ${(
                            listing.price.currency_code ?? ""
                          ).toUpperCase()}`
                        : "Price unavailable"}
                    </div>
                    {formatListingDetails(listing).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formatListingDetails(listing).map((detail) => (
                          <span
                            key={detail}
                            className="rounded-md bg-gray-100 px-2 py-1 text-small-regular text-ui-fg-subtle"
                          >
                            {detail}
                          </span>
                        ))}
                      </div>
                    )}
                    {listing.status === "active" && (
                      <p className="mt-2 text-small-regular text-ui-fg-subtle">
                        {formatReviewedAt(listing.reviewed_at)
                          ? `Reviewed ${formatReviewedAt(listing.reviewed_at)}. `
                          : ""}
                        Edits to active listings require review before they appear
                        again.
                      </p>
                    )}
                    {listing.status === "sold" && (
                      <p className="mt-2 text-small-regular text-ui-fg-subtle">
                        This listing is hidden from buyers.
                      </p>
                    )}
                    {listing.status === "rejected" && listing.moderation_note && (
                      <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-small-regular text-rose-700">
                        {formatReviewedAt(listing.reviewed_at) && (
                          <div className="mb-1 text-rose-600">
                            Reviewed {formatReviewedAt(listing.reviewed_at)}
                          </div>
                        )}
                        {listing.moderation_note}
                      </div>
                    )}
                  </div>
                  <div className="small:text-right">
                    {listing.status === "active" && (
                      <LocalizedClientLink
                        href={`/products/${listing.handle}`}
                        className="mb-3 inline-flex text-small-semi text-ui-fg-base hover:text-ui-fg-interactive"
                      >
                        View public listing
                      </LocalizedClientLink>
                    )}
                    <div className="mt-3">
                      <SellerListingEditor listing={listing} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ListingSignal = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-md border border-gray-200 bg-white p-4">
    <div className="text-[11px] font-medium uppercase text-ui-fg-subtle">
      {label}
    </div>
    <div className="mt-1 text-xl-semi text-ui-fg-base">{value}</div>
  </div>
)

export default SellerListings
