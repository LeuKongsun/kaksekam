"use client"

import { SellerListing } from "@lib/data/seller-listings"
import { PencilSquare } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Eye from "@modules/common/icons/eye"
import Package from "@modules/common/icons/package"
import X from "@modules/common/icons/x"
import { useMemo, useState } from "react"
import SellerListingActions from "../seller-listing-actions"

type SellerListingsProps = {
  listings: SellerListing[]
  totalListings: number
  statusCounts: Record<SellerListing["status"], number>
  page: number
  pageSize: number
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

const editableStatuses = new Set<SellerListing["status"]>([
  "draft",
  "pending_review",
  "active",
  "rejected",
])

const detailLabels: [keyof SellerListing, string][] = [
  ["category", "Category"],
  ["location", "Location"],
  ["quantity", "Quantity"],
  ["unit", "Unit"],
  ["availability", "Availability"],
  ["condition", "Condition"],
  ["variety", "Variety"],
  ["production_method", "Production method"],
  ["harvest_date", "Harvest date"],
  ["breed", "Breed"],
  ["age", "Age"],
  ["sex", "Sex"],
  ["health_notes", "Health notes"],
  ["brand", "Brand"],
  ["equipment_model", "Model"],
  ["year", "Year"],
  ["pack_size", "Pack size"],
  ["expiry_date", "Expiry date"],
  ["service_area", "Service area"],
]

const formatPrice = (listing: SellerListing) => {
  if (listing.price?.calculated_amount == null) {
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
}: SellerListingsProps) => {
  const [statusFilter, setStatusFilter] = useState<
    SellerListing["status"] | "all"
  >("all")
  const [query, setQuery] = useState("")
  const [pageIndex, setPageIndex] = useState(Math.max(0, page - 1))
  const [selectedListing, setSelectedListing] = useState<SellerListing | null>(
    null
  )

  const filteredListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return listings.filter((listing) => {
      const matchesStatus =
        statusFilter === "all" || listing.status === statusFilter
      const searchable = [
        listing.title,
        listing.description,
        listing.category,
        listing.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      const matchesQuery =
        normalizedQuery.length === 0 || searchable.includes(normalizedQuery)

      return matchesStatus && matchesQuery
    })
  }, [listings, query, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / pageSize))
  const safePageIndex = Math.min(pageIndex, totalPages - 1)
  const visibleListings = filteredListings.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize
  )
  const pageStart =
    filteredListings.length === 0 ? 0 : safePageIndex * pageSize + 1
  const pageEnd = Math.min(
    safePageIndex * pageSize + pageSize,
    filteredListings.length
  )

  const updateStatusFilter = (value: SellerListing["status"] | "all") => {
    setStatusFilter(value)
    setPageIndex(0)
  }

  const updateQuery = (value: string) => {
    setQuery(value)
    setPageIndex(0)
  }

  return (
    <div className="w-full" data-testid="seller-listings-page-wrapper">
      <div className="rounded-md border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-4 small:flex-row small:items-center small:justify-between">
          <div>
            <h1 className="text-large-semi text-ui-fg-base">Listings</h1>
            <p className="mt-1 text-small-regular text-ui-fg-subtle">
              {totalListings} total, {statusCounts.active} active,{" "}
              {statusCounts.pending_review} pending review.
            </p>
          </div>
          <LocalizedClientLink
            href="/account/listings/new"
            className="inline-flex h-10 items-center justify-center gap-x-2 rounded-md bg-ui-fg-base px-4 text-small-semi text-white transition-colors hover:bg-ui-fg-subtle"
          >
            <Package size={16} />
            Add listing
          </LocalizedClientLink>
        </div>

        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 small:flex-row small:items-center small:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-small-regular text-ui-fg-subtle">
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(event) =>
                updateStatusFilter(
                  event.target.value as SellerListing["status"] | "all"
                )
              }
              className="h-9 rounded-md border border-gray-200 bg-white px-3 text-small-regular text-ui-fg-base outline-none transition-colors focus:border-ui-fg-base"
            >
              <option value="all">All statuses</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <input
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Search listings"
            className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-small-regular text-ui-fg-base outline-none transition-colors placeholder:text-ui-fg-muted focus:border-ui-fg-base small:max-w-[260px]"
          />
        </div>

        <ListingsTable
          listings={visibleListings}
          onSelectListing={setSelectedListing}
        />

        <div className="flex flex-col gap-3 border-t border-gray-200 p-4 text-small-regular text-ui-fg-subtle small:flex-row small:items-center small:justify-between">
          <span>
            Showing {pageStart}-{pageEnd} of {filteredListings.length} listings.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-9 rounded-md border border-gray-200 bg-white px-3 text-small-semi text-ui-fg-base transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
              disabled={safePageIndex === 0}
              onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="h-9 rounded-md border border-gray-200 bg-white px-3 text-small-semi text-ui-fg-base transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
              disabled={safePageIndex >= totalPages - 1}
              onClick={() =>
                setPageIndex((current) => Math.min(totalPages - 1, current + 1))
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  )
}

const ListingsTable = ({
  listings,
  onSelectListing,
}: {
  listings: SellerListing[]
  onSelectListing: (listing: SellerListing) => void
}) => (
  <div className="w-full max-w-full overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-left">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr className="text-[11px] font-medium uppercase text-ui-fg-subtle">
            <th className="w-[30%] px-4 py-3">Listing</th>
            <th className="w-[14%] px-4 py-3">Category</th>
            <th className="w-[12%] px-4 py-3">Price</th>
            <th className="w-[12%] px-4 py-3">Status</th>
            <th className="w-[10%] px-4 py-3">Updated</th>
            <th className="w-[22%] px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {listings.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-16">
                <div className="flex flex-col items-center justify-center text-center text-ui-fg-muted">
                  <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-gray-300 bg-ui-bg-subtle">
                    <Package size={28} />
                  </div>
                  <p className="mt-3 text-small-semi text-ui-fg-base">
                    No data
                  </p>
                  <p className="mt-1 text-small-regular text-ui-fg-subtle">
                    Listings you create will appear here.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            listings.map((listing) => (
              <ListingRow
                key={listing.id}
                listing={listing}
                onSelectListing={onSelectListing}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
)

const ListingRow = ({
  listing,
  onSelectListing,
}: {
  listing: SellerListing
  onSelectListing: (listing: SellerListing) => void
}) => {
  const meta = statusMeta[listing.status]
  const canView = listing.status === "active"
  const canEdit = editableStatuses.has(listing.status)

  return (
    <tr className="align-middle hover:bg-gray-50/70">
      <td className="px-4 py-3 align-middle">
        <div className="flex min-w-0 gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-[#eef4e8]">
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
            <p className="truncate text-small-regular text-ui-fg-subtle">
              {listing.description || "No description added."}
            </p>
          </div>
        </div>
      </td>
      <td className="truncate px-4 py-3 text-base-regular text-ui-fg-base">
        {listing.category || "-"}
      </td>
      <td className="truncate px-4 py-3 text-base-semi text-ui-fg-base">
        {formatPrice(listing)}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-md border px-2.5 py-1 text-small-semi ${meta.tone}`}
        >
          {statusLabels[listing.status]}
        </span>
      </td>
      <td className="truncate px-4 py-3 text-base-regular text-ui-fg-subtle">
        {formatDate(listing.updated_at)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          {canView ? (
            <LocalizedClientLink
              href={`/products/${listing.handle}`}
              className={iconActionClass}
              title="View"
              aria-label="View listing"
            >
              <Eye size={16} />
            </LocalizedClientLink>
          ) : (
            <button
              type="button"
              className={iconActionClass}
              title="View"
              aria-label="View listing"
              disabled
            >
              <Eye size={16} />
            </button>
          )}
          {canEdit ? (
            <LocalizedClientLink
              href={`/account/listings/${listing.id}/edit`}
              className={iconActionClass}
              title="Edit"
              aria-label="Edit listing"
            >
              <PencilSquare />
            </LocalizedClientLink>
          ) : (
            <button
              type="button"
              className={iconActionClass}
              title="Edit"
              aria-label="Edit listing"
              disabled
            >
              <PencilSquare />
            </button>
          )}
          <SellerListingActions
            listing={listing}
            onViewDetails={() => onSelectListing(listing)}
          />
        </div>
      </td>
    </tr>
  )
}

const ListingDetailsModal = ({
  listing,
  onClose,
}: {
  listing: SellerListing
  onClose: () => void
}) => {
  const images = getListingImages(listing)
  const details = detailLabels
    .map(([key, label]) => {
      const value = listing[key]

      return value ? { label, value: String(value) } : null
    })
    .filter(Boolean) as { label: string; value: string }[]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="max-h-full w-full max-w-3xl overflow-hidden rounded-md bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-4">
          <div className="min-w-0">
            <p className="text-small-regular text-ui-fg-subtle">
              {statusLabels[listing.status]}
            </p>
            <h2 className="mt-1 truncate text-large-semi text-ui-fg-base">
              {listing.title}
            </h2>
          </div>
          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 text-ui-fg-base transition-colors hover:bg-gray-50"
            onClick={onClose}
            aria-label="Close details"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-4">
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 small:grid-cols-4">
              {images.map((url) => (
                <div
                  key={url}
                  className="aspect-square overflow-hidden rounded-md bg-ui-bg-subtle"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 grid gap-4 small:grid-cols-[1fr_220px]">
            <div>
              <h3 className="text-base-semi text-ui-fg-base">Description</h3>
              <p className="mt-2 whitespace-pre-line text-base-regular text-ui-fg-subtle">
                {listing.description || "No description added."}
              </p>
            </div>
            <div className="rounded-md border border-gray-200 p-3">
              <div className="text-[11px] font-medium uppercase text-ui-fg-muted">
                Price
              </div>
              <div className="mt-1 text-large-semi text-ui-fg-base">
                {formatPrice(listing)}
              </div>
              <div className="mt-3 text-[11px] font-medium uppercase text-ui-fg-muted">
                Updated
              </div>
              <div className="mt-1 text-small-regular text-ui-fg-subtle">
                {formatDate(listing.updated_at)}
              </div>
            </div>
          </div>

          {listing.status === "rejected" && listing.moderation_note && (
            <div className="mt-5 rounded-md border border-rose-200 bg-rose-50 p-3 text-small-regular text-rose-700">
              {listing.moderation_note}
            </div>
          )}

          {details.length > 0 && (
            <div className="mt-5 grid gap-3 small:grid-cols-2">
              {details.map((detail) => (
                <div
                  key={detail.label}
                  className="rounded-md border border-gray-200 p-3"
                >
                  <div className="text-[11px] font-medium uppercase text-ui-fg-muted">
                    {detail.label}
                  </div>
                  <div className="mt-1 text-small-regular text-ui-fg-base">
                    {detail.value}
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

const getListingImages = (listing: SellerListing) =>
  Array.from(new Set([listing.thumbnail, ...(listing.image_urls ?? [])])).filter(
    Boolean
  ) as string[]

const formatDate = (value?: string | null) => {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

const iconActionClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-ui-fg-base transition-colors hover:bg-gray-50 hover:text-ui-fg-interactive"

export default SellerListings
