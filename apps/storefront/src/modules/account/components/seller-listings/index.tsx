"use client"

import { SellerListing } from "@lib/data/seller-listings"
import type { SellerContactMetrics } from "@lib/data/contact-metrics"
import { richTextToPlainText } from "@lib/util/rich-text"
import { PencilSquare } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import RichTextContent from "@modules/common/components/rich-text-content"
import Eye from "@modules/common/icons/eye"
import Package from "@modules/common/icons/package"
import X from "@modules/common/icons/x"
import { useEffect, useMemo, useState } from "react"
import SellerListingActions from "../seller-listing-actions"
import { useTranslation } from "@lib/i18n/context"

type SellerListingsProps = {
  listings: SellerListing[]
  totalListings: number
  statusCounts: Record<SellerListing["status"], number>
  page: number
  pageSize: number
  contactMetrics: SellerContactMetrics
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
  "expired",
])

const formatPrice = (listing: SellerListing, t: any) => {
  if (listing.price?.calculated_amount == null) {
    return t.common.priceUnavailable
  }

  return `${listing.price.calculated_amount} ${(
    listing.price.currency_code ?? ""
  ).toUpperCase()}`
}

const formatDate = (value?: string | null, locale = "en") => {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

const getExpiryLabel = (listing: SellerListing, t: any, locale: string) => {
  if (!listing.expires_at) {
    return null
  }

  const expiresAt = new Date(listing.expires_at)
  const daysLeft = Math.ceil(
    (expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
  )

  if (listing.status === "expired" || daysLeft < 0) {
    return t.account.expiredOn.replace(
      "{date}",
      formatDate(listing.expires_at, locale)
    )
  }

  if (daysLeft <= 7) {
    return t.account.expiresInDays.replace("{days}", String(daysLeft))
  }

  return t.account.expiresOn.replace(
    "{date}",
    formatDate(listing.expires_at, locale)
  )
}

const SellerListings = ({
  listings,
  totalListings,
  statusCounts,
  page,
  pageSize,
  contactMetrics,
}: SellerListingsProps) => {
  const { t, locale } = useTranslation()
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
        richTextToPlainText(listing.description),
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
            <h1 className="text-large-semi text-ui-fg-base">
              {t.account.products}
            </h1>
            <p className="mt-1 text-small-regular text-ui-fg-subtle">
              {totalListings} {t.account.totalProducts}, {statusCounts.active}{" "}
              {t.account.active}, {statusCounts.pending_review}{" "}
              {t.account.pendingReview}.
            </p>
          </div>
          <LocalizedClientLink
            href="/account/listings/new"
            className="inline-flex h-10 items-center justify-center gap-x-2 rounded-md bg-ui-fg-base px-4 text-small-semi text-white transition-colors hover:bg-ui-fg-subtle"
          >
            <Package size={16} />
            {t.account.addProduct}
          </LocalizedClientLink>
        </div>

        <div className="grid grid-cols-2 gap-px border-b border-gray-200 bg-gray-200 small:grid-cols-5">
          {[
            [t.account.contactClicks, contactMetrics.total],
            [t.account.last14Days, contactMetrics.last_14_days],
            ["Telegram", contactMetrics.telegram],
            [t.account.messengerClicks, contactMetrics.messenger],
            [t.account.callClicks, contactMetrics.phone],
          ].map(([label, value]) => (
            <div key={String(label)} className="bg-[#fbfbf7] px-4 py-3">
              <div className="text-large-semi text-ui-fg-base">{value}</div>
              <div className="mt-1 text-xsmall-regular text-ui-fg-subtle">
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 small:flex-row small:items-center small:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-small-regular text-ui-fg-subtle">
              {t.account.status}
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
              <option value="all">{t.account.allStatuses}</option>
              {Object.entries(t.account.statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <input
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder={t.account.searchProducts}
            className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-small-regular text-ui-fg-base outline-none transition-colors placeholder:text-ui-fg-muted focus:border-ui-fg-base small:max-w-[260px]"
          />
        </div>

        <ListingsGrid
          listings={visibleListings}
          onSelectListing={setSelectedListing}
          t={t}
          locale={locale}
        />

        <div className="flex flex-col gap-3 border-t border-gray-200 p-4 text-small-regular text-ui-fg-subtle small:flex-row small:items-center small:justify-between">
          <span>
            {t.account.showing} {pageStart}-{pageEnd} {t.account.of}{" "}
            {filteredListings.length} {t.account.productsCount}.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-9 rounded-md border border-gray-200 bg-white px-3 text-small-semi text-ui-fg-base transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
              disabled={safePageIndex === 0}
              onClick={() =>
                setPageIndex((current) => Math.max(0, current - 1))
              }
            >
              {t.account.previous}
            </button>
            <button
              type="button"
              className="h-9 rounded-md border border-gray-200 bg-white px-3 text-small-semi text-ui-fg-base transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
              disabled={safePageIndex >= totalPages - 1}
              onClick={() =>
                setPageIndex((current) => Math.min(totalPages - 1, current + 1))
              }
            >
              {t.account.next}
            </button>
          </div>
        </div>
      </div>

      {selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          t={t}
          locale={locale}
        />
      )}
    </div>
  )
}

const ListingsGrid = ({
  listings,
  onSelectListing,
  t,
  locale,
}: {
  listings: SellerListing[]
  onSelectListing: (listing: SellerListing) => void
  t: any
  locale: string
}) => (
  <div className="p-4">
    {listings.length === 0 ? (
      <div className="flex min-h-[260px] flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-[#fbfbf7] p-6 text-center text-ui-fg-muted">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-ui-fg-base shadow-sm">
          <Package size={28} />
        </div>
        <p className="mt-3 text-small-semi text-ui-fg-base">
          {t.account.noProductsYet}
        </p>
        <p className="mt-1 max-w-sm text-small-regular text-ui-fg-subtle">
          {t.account.productsAppearHere}
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-4 small:grid-cols-2 large:grid-cols-4">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onSelectListing={onSelectListing}
            t={t}
            locale={locale}
          />
        ))}
      </div>
    )}
  </div>
)

const ListingCard = ({
  listing,
  onSelectListing,
  t,
  locale,
}: {
  listing: SellerListing
  onSelectListing: (listing: SellerListing) => void
  t: any
  locale: string
}) => {
  const meta = statusMeta[listing.status]
  const canEdit = editableStatuses.has(listing.status)
  const plainDescription = richTextToPlainText(listing.description)
  const quantity =
    listing.quantity && listing.unit
      ? `${listing.quantity} ${listing.unit}`
      : listing.quantity
  const expiryLabel = getExpiryLabel(listing, t, locale)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition-colors hover:border-gray-400">
      <div className="relative aspect-[1.5] bg-[#eef4e8]">
        {listing.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.thumbnail}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-small-semi text-ui-fg-subtle">
            {t.account.noPhoto}
          </div>
        )}
        <span
          className={`absolute left-2.5 top-2.5 inline-flex rounded-full border px-2 py-0.5 text-xsmall-semi shadow-sm ${meta.tone}`}
        >
          {t.account.statusLabels[listing.status]}
        </span>
      </div>
      <div className="flex min-h-[136px] flex-1 flex-col gap-2 p-2.5 small:p-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h2 className="line-clamp-2 text-small-semi font-bold text-brand">
              {listing.title}
            </h2>
            <span className="shrink-0 text-small-semi text-ui-fg-base">
              {formatPrice(listing, t)}
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-xsmall-regular text-ui-fg-subtle">
            {plainDescription || t.common.noDescription}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            listing.category
              ? t.store.categories[
                  listing.category as keyof typeof t.store.categories
                ] ?? listing.category
              : undefined,
            listing.location,
            quantity,
            listing.condition
              ? t.store.conditionOptions[
                  listing.condition as keyof typeof t.store.conditionOptions
                ] ?? listing.condition
              : undefined,
          ]
            .filter(Boolean)
            .slice(0, 4)
            .map((detail) => (
              <span
                key={detail}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xsmall-regular text-ui-fg-subtle"
              >
                {detail}
              </span>
            ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-xsmall-regular text-ui-fg-muted">
            {expiryLabel ||
              `${t.account.updatedAt} ${formatDate(
                listing.updated_at,
                locale
              )}`}
          </span>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className={iconActionClass}
              title={t.account.viewListing}
              aria-label={t.account.viewListing}
              onClick={() => onSelectListing(listing)}
            >
              <Eye size={16} />
            </button>
            {canEdit ? (
              <LocalizedClientLink
                href={`/account/listings/${listing.id}/edit`}
                className={iconActionClass}
                title={t.account.editProductBtn}
                aria-label={t.account.editProductBtn}
              >
                <PencilSquare />
              </LocalizedClientLink>
            ) : (
              <button
                type="button"
                className={iconActionClass}
                title={t.account.editProductBtn}
                aria-label={t.account.editProductBtn}
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
        </div>
      </div>
    </article>
  )
}

const ListingDetailsModal = ({
  listing,
  onClose,
  t,
  locale,
}: {
  listing: SellerListing
  onClose: () => void
  t: any
  locale: string
}) => {
  const images = getListingImages(listing)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const category = listing.category
    ? t.store.categories[listing.category as keyof typeof t.store.categories] ??
      listing.category
    : null
  const condition = listing.condition
    ? t.store.conditionOptions[
        listing.condition as keyof typeof t.store.conditionOptions
      ] ?? listing.condition
    : null
  const quantity =
    listing.quantity && listing.unit
      ? `${listing.quantity} ${listing.unit}`
      : listing.quantity
  const contactPreference =
    listing.contact_preference === "telegram"
      ? t.account.contactTelegram
      : listing.contact_preference === "messenger"
      ? t.account.contactMessenger
      : listing.contact_preference === "phone"
      ? t.account.contactPhone
      : null
  const details = [
    [t.account.farmingCategory, category],
    [t.account.province, listing.location],
    [t.account.district, listing.district],
    [t.account.quantity, quantity],
    [t.account.minimumOrder, listing.minimum_order],
    [t.account.condition, condition],
    [t.account.availability, listing.availability],
    [t.account.productionMethod, listing.production_method],
    [t.account.preferredContact, contactPreference],
  ].filter((detail): detail is [string, string] => Boolean(detail[1]))

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-[1px] small:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-preview-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-md bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-3 small:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xsmall-semi ${
                statusMeta[listing.status].tone
              }`}
            >
              {t.account.statusLabels[listing.status]}
            </span>
            <span className="truncate text-small-regular text-ui-fg-subtle">
              {t.account.updatedAt} {formatDate(listing.updated_at, locale)}
            </span>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ui-fg-subtle transition-colors hover:bg-gray-100 hover:text-ui-fg-base focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
            onClick={onClose}
            aria-label="Close details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 small:p-6">
          <div className="grid grid-cols-1 gap-6 medium:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] medium:items-start">
            <div className="min-w-0">
              <div className="aspect-[4/3] overflow-hidden rounded-md bg-[#eef4e8]">
                {images[activeImageIndex] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={images[activeImageIndex]}
                    alt={`${listing.title} ${activeImageIndex + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-small-semi text-ui-fg-subtle">
                    {t.account.noPhoto}
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div
                  className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1"
                  aria-label="Choose listing image"
                >
                  {images.map((url, index) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      aria-label={`Show listing image ${index + 1}`}
                      aria-current={activeImageIndex === index}
                      className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-md border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 ${
                        activeImageIndex === index
                          ? "border-ui-fg-base"
                          : "border-ui-border-base hover:border-ui-fg-subtle"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h2
                id="listing-preview-title"
                className="break-words text-2xl-semi leading-tight text-ui-fg-base"
              >
                {listing.title}
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-2xl-semi text-brand">
                  {formatPrice(listing, t)}
                </span>
                {listing.negotiable && (
                  <span className="rounded-full bg-amber-50 px-2 py-1 text-xsmall-semi text-amber-800">
                    {t.account.priceNegotiable}
                  </span>
                )}
              </div>

              {details.length > 0 && (
                <dl className="mt-5 divide-y divide-gray-100 border-y border-gray-200">
                  {details.map(([label, value]) => (
                    <div
                      key={label}
                      className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 py-2.5"
                    >
                      <dt className="text-small-regular text-ui-fg-muted">
                        {label}
                      </dt>
                      <dd className="break-words text-right text-small-semi text-ui-fg-base">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {listing.expires_at && (
                <p className="mt-3 text-small-regular text-ui-fg-subtle">
                  {getExpiryLabel(listing, t, locale)}
                </p>
              )}

              {listing.status === "rejected" && listing.moderation_note && (
                <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-small-regular text-rose-700">
                  {listing.moderation_note}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-base-semi text-ui-fg-base">
              {t.common.description}
            </h3>
            {listing.description ? (
              <RichTextContent
                content={listing.description}
                className="mt-3 max-w-3xl whitespace-pre-line text-base-regular leading-relaxed text-ui-fg-subtle [&_a]:text-ui-fg-interactive [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
              />
            ) : (
              <p className="mt-3 text-base-regular text-ui-fg-muted">
                {t.common.noDescription}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3 small:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 text-small-semi text-ui-fg-base transition-colors hover:bg-gray-50"
          >
            {t.common.close ?? "Close"}
          </button>
          {editableStatuses.has(listing.status) && (
            <LocalizedClientLink
              href={`/account/listings/${listing.id}/edit`}
              className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base"
            >
              {t.account.editProductBtn}
            </LocalizedClientLink>
          )}
          {listing.status === "active" && (
            <LocalizedClientLink
              href={`/products/${listing.handle}`}
              className="inline-flex h-10 items-center justify-center rounded-md bg-ui-fg-base px-4 text-small-semi text-white transition-colors hover:bg-ui-fg-subtle"
            >
              {t.account.viewListing}
            </LocalizedClientLink>
          )}
        </div>
      </div>
    </div>
  )
}

const getListingImages = (listing: SellerListing) =>
  Array.from(
    new Set([listing.thumbnail, ...(listing.image_urls ?? [])])
  ).filter(Boolean) as string[]

const iconActionClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-ui-fg-base transition-colors hover:bg-gray-50 hover:text-ui-fg-interactive"

export default SellerListings
