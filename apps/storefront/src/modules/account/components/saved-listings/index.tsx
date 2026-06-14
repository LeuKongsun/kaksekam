import { SavedListing } from "@lib/data/saved-listings"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Eye from "@modules/common/icons/eye"
import Package from "@modules/common/icons/package"
import { Pagination } from "@modules/store/components/pagination"
import { ReactNode } from "react"
import RemoveSavedListingButton from "../remove-saved-listing-button"

type SavedListingsProps = {
  savedListings: SavedListing[]
  totalSavedListings: number
  page: number
  pageSize: number
  totalPages: number
}

const formatPrice = (price: SavedListing["product"]["price"]) => {
  if (!price?.calculated_amount) {
    return "Price unavailable"
  }

  return `${price.calculated_amount} ${(
    price.currency_code ?? ""
  ).toUpperCase()} asking`
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
    listing?.variety,
    listing?.production_method,
    listing?.harvest_date,
    listing?.breed,
    listing?.age,
    listing?.sex,
    listing?.health_notes,
    listing?.brand,
    listing?.equipment_model,
    listing?.year,
    listing?.pack_size,
    listing?.expiry_date,
    listing?.service_area,
  ].filter(Boolean)

const SavedListings = ({
  savedListings,
  totalSavedListings,
  page,
  pageSize,
  totalPages,
}: SavedListingsProps) => {
  const pageStart = totalSavedListings === 0 ? 0 : (page - 1) * pageSize + 1
  const pageEnd = Math.min(page * pageSize, totalSavedListings)

  return (
    <div className="w-full" data-testid="saved-listings-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h2 className="text-2xl-semi">Saved products</h2>
        {totalSavedListings > 0 && (
          <p className="text-base-regular text-ui-fg-subtle">
            Showing {pageStart}-{pageEnd} of {totalSavedListings} saved
            products.
          </p>
        )}
      </div>

      {totalSavedListings === 0 ? (
        <SavedListingsTable savedListings={[]} startIndex={0} />
      ) : (
        <div>
          <SavedListingsTable
            savedListings={savedListings}
            startIndex={pageStart}
          />
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              data-testid="saved-listings-pagination"
            />
          )}
        </div>
      )}
    </div>
  )
}

const SavedListingsTable = ({
  savedListings,
  startIndex,
}: {
  savedListings: SavedListing[]
  startIndex: number
}) => (
  <div className="w-full max-w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-left">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr className="text-[11px] font-medium uppercase text-ui-fg-subtle">
            <th className="w-12 px-3 py-4">No.</th>
            <th className="w-[30%] px-3 py-4">Listing</th>
            <th className="w-[18%] px-3 py-4">Seller</th>
            <th className="w-[13%] px-3 py-4">Price</th>
            <th className="w-[20%] px-3 py-4">Details</th>
            <th className="w-[19%] px-3 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {savedListings.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-16">
                <div className="flex justify-center text-ui-fg-muted">
                  <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-gray-300 bg-ui-bg-subtle">
                    <Package size={28} />
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            savedListings.map((savedListing, index) => (
              <SavedListingRow
                key={savedListing.id}
                savedListing={savedListing}
                rowNumber={startIndex + index}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
)

const SavedListingRow = ({
  savedListing,
  rowNumber,
}: {
  savedListing: SavedListing
  rowNumber: number
}) => {
  const details = formatListingDetails(savedListing.product.listing).slice(0, 4)
  const seller = savedListing.product.seller

  return (
    <tr className="align-top hover:bg-gray-50/70">
      <td className="px-3 py-4 text-base-regular text-ui-fg-subtle">
        {rowNumber}
      </td>
      <td className="px-3 py-4">
        <div className="flex min-w-0 gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gray-100">
            {savedListing.product.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={savedListing.product.thumbnail}
                alt={savedListing.product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-2 text-center text-[11px] text-ui-fg-subtle">
                No photo
              </div>
            )}
          </div>
          <div className="min-w-0">
            <LocalizedClientLink
              href={`/products/${savedListing.product.handle}`}
              className="block truncate text-base-semi text-ui-fg-base hover:text-ui-fg-interactive"
            >
              {savedListing.product.title}
            </LocalizedClientLink>
            <p className="mt-1 line-clamp-2 text-small-regular text-ui-fg-subtle">
              {savedListing.product.description || "No description added."}
            </p>
          </div>
        </div>
      </td>
      <td className="break-words px-3 py-4 text-small-regular text-ui-fg-subtle">
        {seller ? (
          <>
            <div className="text-base-semi text-ui-fg-base">
              {seller.display_name}
            </div>
            {seller.location && <div className="mt-1">{seller.location}</div>}
          </>
        ) : (
          "Seller unavailable"
        )}
      </td>
      <td className="break-words px-3 py-4 text-base-semi text-ui-fg-base">
        {formatPrice(savedListing.product.price)}
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
            No listing details.
          </div>
        )}
      </td>
      <td className="px-3 py-4">
        <div className="flex items-center gap-2 small:justify-end">
          <LocalizedClientLink
            href={`/products/${savedListing.product.handle}`}
            className={iconActionClass}
            title="View"
            aria-label="View listing"
          >
            <Eye size={16} />
            <ActionTooltip>View</ActionTooltip>
          </LocalizedClientLink>
          <RemoveSavedListingButton
            savedListingId={savedListing.id}
            variant="icon"
          />
        </div>
      </td>
    </tr>
  )
}

const iconActionClass =
  "group relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-ui-fg-base transition-colors hover:bg-gray-50 hover:text-ui-fg-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-fg-base"

const ActionTooltip = ({ children }: { children: ReactNode }) => (
  <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-ui-fg-base px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
    {children}
  </span>
)

export default SavedListings
