import { SavedListing } from "@lib/data/saved-listings"
import { richTextToPlainText } from "@lib/util/rich-text"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Eye from "@modules/common/icons/eye"
import Package from "@modules/common/icons/package"
import { Pagination } from "@modules/store/components/pagination"
import RemoveSavedListingButton from "../remove-saved-listing-button"

type SavedListingsProps = {
  savedListings: SavedListing[]
  totalSavedListings: number
  page: number
  pageSize: number
  totalPages: number
}

const formatPrice = (price: SavedListing["product"]["price"]) => {
  if (price?.calculated_amount == null) {
    return "Price unavailable"
  }

  return `${price.calculated_amount} ${(
    price.currency_code ?? ""
  ).toUpperCase()}`
}

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
      <div className="rounded-md border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-200 p-4">
          <h1 className="text-large-semi text-ui-fg-base">Saved listings</h1>
          <p className="text-small-regular text-ui-fg-subtle">
            Showing {pageStart}-{pageEnd} of {totalSavedListings} saved
            listings.
          </p>
        </div>

        <SavedListingsTable savedListings={savedListings} />

        {totalPages > 1 && (
          <div className="border-t border-gray-200 p-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              data-testid="saved-listings-pagination"
            />
          </div>
        )}
      </div>
    </div>
  )
}

const SavedListingsTable = ({
  savedListings,
}: {
  savedListings: SavedListing[]
}) => (
  <div className="w-full max-w-full overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-left">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr className="text-xsmall-semi font-medium uppercase text-ui-fg-subtle">
            <th className="w-[34%] px-4 py-3">Listing</th>
            <th className="w-[22%] px-4 py-3">Seller</th>
            <th className="w-[14%] px-4 py-3">Price</th>
            <th className="w-[14%] px-4 py-3">Saved</th>
            <th className="w-[16%] px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {savedListings.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-16">
                <EmptyState />
              </td>
            </tr>
          ) : (
            savedListings.map((savedListing) => (
              <SavedListingRow
                key={savedListing.id}
                savedListing={savedListing}
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
}: {
  savedListing: SavedListing
}) => {
  const seller = savedListing.product.seller
  const plainDescription = richTextToPlainText(savedListing.product.description)

  return (
    <tr className="align-middle hover:bg-gray-50/70">
      <td className="px-4 py-3">
        <div className="flex min-w-0 gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-gray-100">
            {savedListing.product.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={savedListing.product.thumbnail}
                alt={savedListing.product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ui-fg-muted">
                <Package size={18} />
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
            <p className="truncate text-small-regular text-ui-fg-subtle">
              {plainDescription || "No description added."}
            </p>
          </div>
        </div>
      </td>
      <td className="truncate px-4 py-3 text-base-regular text-ui-fg-base">
        {seller?.display_name ?? "Seller unavailable"}
      </td>
      <td className="truncate px-4 py-3 text-base-semi text-ui-fg-base">
        {formatPrice(savedListing.product.price)}
      </td>
      <td className="truncate px-4 py-3 text-base-regular text-ui-fg-subtle">
        {formatDate(savedListing.created_at)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 small:justify-end">
          <LocalizedClientLink
            href={`/products/${savedListing.product.handle}`}
            className={iconActionClass}
            title="View"
            aria-label="View listing"
          >
            <Eye size={16} />
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

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center text-center text-ui-fg-muted">
    <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-gray-300 bg-ui-bg-subtle">
      <Package size={28} />
    </div>
    <p className="mt-3 text-small-semi text-ui-fg-base">No data</p>
    <p className="mt-1 text-small-regular text-ui-fg-subtle">
      Saved listings will appear here.
    </p>
  </div>
)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))

const iconActionClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-ui-fg-base transition-colors hover:bg-gray-50 hover:text-ui-fg-interactive"

export default SavedListings
