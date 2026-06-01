import { SavedListing } from "@lib/data/saved-listings"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import RemoveSavedListingButton from "../remove-saved-listing-button"

type SavedListingsProps = {
  savedListings: SavedListing[]
}

const formatPrice = (price: SavedListing["product"]["price"]) => {
  if (!price?.calculated_amount) {
    return "Price unavailable"
  }

  return `${price.calculated_amount} ${(
    price.currency_code ?? ""
  ).toUpperCase()}`
}

const formatListingDetails = (listing: SavedListing["product"]["listing"]) =>
  [
    listing?.category,
    listing?.location,
    listing?.quantity && listing?.unit
      ? `${listing.quantity} ${listing.unit}`
      : listing?.quantity,
    listing?.availability,
    listing?.condition,
  ].filter(Boolean)

const SavedListings = ({ savedListings }: SavedListingsProps) => {
  return (
    <div className="w-full" data-testid="saved-listings-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h2 className="text-2xl-semi">Saved listings</h2>
        <p className="text-base-regular text-ui-fg-subtle">
          Keep track of listings you want to revisit.
        </p>
      </div>

      {savedListings.length === 0 ? (
        <div className="rounded-md border border-gray-200 p-4 text-base-regular text-ui-fg-subtle">
          No saved listings yet.
        </div>
      ) : (
        <div className="divide-y divide-gray-200 rounded-md border border-gray-200">
          {savedListings.map((savedListing) => (
            <div
              key={savedListing.id}
              className="grid grid-cols-1 gap-4 p-4 small:grid-cols-[96px_1fr_auto]"
            >
              <div className="aspect-square overflow-hidden rounded-md bg-gray-100">
                {savedListing.product.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={savedListing.product.thumbnail}
                    alt={savedListing.product.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div>
                <LocalizedClientLink
                  href={`/products/${savedListing.product.handle}`}
                  className="text-base-semi hover:text-ui-fg-interactive"
                >
                  {savedListing.product.title}
                </LocalizedClientLink>
                {savedListing.product.description && (
                  <p className="mt-1 line-clamp-2 text-small-regular text-ui-fg-subtle">
                    {savedListing.product.description}
                  </p>
                )}
                <div className="mt-2 flex flex-col gap-y-1 text-small-regular text-ui-fg-subtle">
                  <span>{formatPrice(savedListing.product.price)}</span>
                  {savedListing.product.seller && (
                    <span>
                      {savedListing.product.seller.display_name}
                      {savedListing.product.seller.location
                        ? `, ${savedListing.product.seller.location}`
                        : ""}
                    </span>
                  )}
                </div>
                {formatListingDetails(savedListing.product.listing).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formatListingDetails(savedListing.product.listing).map(
                      (detail) => (
                        <span
                          key={detail}
                          className="rounded-md bg-gray-100 px-2 py-1 text-small-regular text-ui-fg-subtle"
                        >
                          {detail}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>
              <RemoveSavedListingButton savedListingId={savedListing.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SavedListings
