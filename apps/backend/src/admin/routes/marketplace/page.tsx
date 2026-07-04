import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  EmptyState,
  FilterPanel,
  OpsSection,
} from "../../components/marketplace-ops"
import {
  Button,
  DropdownMenu,
  FocusModal,
  IconButton,
  StatusBadge,
  Table,
  Text,
  Textarea,
  Tooltip,
  toast,
} from "@medusajs/ui"
import { ReactNode, SVGProps, useEffect, useMemo, useState } from "react"

type MarketplaceListing = {
  id: string
  product_id: string
  title: string
  handle: string
  description: string | null
  thumbnail: string | null
  images: {
    url: string
  }[]
  status: "pending_review" | "active" | "rejected"
  moderation_note: string | null
  reviewed_at: string | null
  reviewer_id: string | null
  reviewer: {
    id: string
    email: string | null
    first_name: string | null
    last_name: string | null
  } | null
  category: string | null
  location: string | null
  quantity: string | null
  unit: string | null
  condition: string | null
  created_at: string
  seller: {
    id: string
    display_name: string
    email: string | null
    phone: string | null
    location: string | null
    verification_status: "unverified" | "verified"
  } | null
  price: {
    calculated_amount?: number
    currency_code?: string
  } | null
}

type ListingsResponse = {
  listings: MarketplaceListing[]
}

type StatusFilter = "all" | MarketplaceListing["status"]
type SellerVerificationFilter = "all" | "verified" | "unverified"

const statusColor: Record<
  MarketplaceListing["status"],
  "orange" | "green" | "red"
> = {
  pending_review: "orange",
  active: "green",
  rejected: "red",
}

const statusLabel: Record<MarketplaceListing["status"], string> = {
  pending_review: "Pending review",
  active: "Active",
  rejected: "Rejected",
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value))

const formatDateTime = (value: string | null) => {
  if (!value) {
    return null
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

const formatPrice = (price: MarketplaceListing["price"]) => {
  if (!price?.calculated_amount) {
    return "No price"
  }

  return `${price.calculated_amount} ${(
    price.currency_code ?? ""
  ).toUpperCase()}`
}

const formatReviewer = (listing: MarketplaceListing) => {
  if (!listing.reviewer) {
    return listing.reviewer_id
  }

  const name = [listing.reviewer.first_name, listing.reviewer.last_name]
    .filter(Boolean)
    .join(" ")

  return listing.reviewer.email ?? (name || listing.reviewer.id)
}

const listingDetailRows = (listing: MarketplaceListing): [string, string][] =>
  ([
    ["Category", listing.category],
    ["Location", listing.location],
    [
      "Quantity",
      listing.quantity && listing.unit
        ? `${listing.quantity} ${listing.unit}`
        : listing.quantity,
    ],
    ["Condition", listing.condition],
  ] as [string, string | null][]).filter(
    (row): row is [string, string] => Boolean(row[1]),
  )

const listingImages = (listing: MarketplaceListing) => {
  const urls = [
    listing.thumbnail,
    ...listing.images.map((image) => image.url),
  ].filter((url): url is string => Boolean(url))

  return Array.from(new Set(urls))
}

const MarketplacePage = () => {
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sellerVerificationFilter, setSellerVerificationFilter] =
    useState<SellerVerificationFilter>("all")
  const [selectedListing, setSelectedListing] =
    useState<MarketplaceListing | null>(null)
  const [rejectListing, setRejectListing] = useState<MarketplaceListing | null>(
    null,
  )
  const [moderationNotes, setModerationNotes] = useState<
    Record<string, string>
  >({})

  const storefrontBase = useMemo(() => {
    if (typeof window === "undefined") {
      return "http://localhost:8000"
    }

    return window.location.origin.replace(":9000", ":8000")
  }, [])

  const counts = useMemo(
    () => ({
      total: listings.length,
      active: listings.filter((listing) => listing.status === "active").length,
      pending: listings.filter((listing) => listing.status === "pending_review")
        .length,
      rejected: listings.filter((listing) => listing.status === "rejected")
        .length,
    }),
    [listings],
  )

  const categories = useMemo(
    () =>
      Array.from(
        new Set(listings.map((listing) => listing.category).filter(Boolean)),
      ).sort() as string[],
    [listings],
  )

  const filteredListings = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return listings.filter((listing) => {
      const statusMatches =
        statusFilter === "all" || listing.status === statusFilter
      const categoryMatches =
        categoryFilter === "all" || listing.category === categoryFilter
      const sellerVerificationMatches =
        sellerVerificationFilter === "all" ||
        listing.seller?.verification_status === sellerVerificationFilter
      const searchable = [
        listing.title,
        listing.description,
        listing.category,
        listing.location,
        listing.seller?.display_name,
        listing.seller?.email,
        listing.seller?.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      const searchMatches =
        !normalizedSearch || searchable.includes(normalizedSearch)

      return (
        statusMatches &&
        categoryMatches &&
        sellerVerificationMatches &&
        searchMatches
      )
    })
  }, [
    categoryFilter,
    listings,
    searchTerm,
    sellerVerificationFilter,
    statusFilter,
  ])

  const loadListings = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/admin/listing-moderation")

      if (!response.ok) {
        throw new Error("Could not load marketplace listings")
      }

      const data = (await response.json()) as ListingsResponse
      setListings(data.listings)
      setModerationNotes(
        data.listings.reduce<Record<string, string>>((acc, listing) => {
          acc[listing.id] = listing.moderation_note ?? ""
          return acc
        }, {}),
      )
    } catch (error) {
      toast.error("Unable to load marketplace listings", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (
    listing: MarketplaceListing,
    status: "active" | "rejected",
  ) => {
    const moderationNote = moderationNotes[listing.id]?.trim() ?? ""

    if (status === "rejected" && !moderationNote) {
      toast.error("Add a rejection reason")
      return
    }

    setUpdatingId(listing.id)

    try {
      const response = await fetch(`/admin/listing-moderation/${listing.id}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          status,
          moderation_note: status === "rejected" ? moderationNote : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error(
          `Could not ${status === "active" ? "approve" : "reject"} listing`,
        )
      }

      toast.success(
        status === "active" ? "Listing approved" : "Listing rejected",
        {
          description: listing.title,
        },
      )

      await loadListings()
      if (status === "rejected") {
        setRejectListing(null)
      }
    } catch (error) {
      toast.error("Unable to update listing", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setUpdatingId(null)
    }
  }

  useEffect(() => {
    void loadListings()
  }, [])

  return (
    <div className="flex flex-col gap-y-6">
      <OpsSection
        title="Marketplace"
        subtitle={`${counts.total} listings, ${counts.active} active, ${counts.pending} pending review, ${counts.rejected} rejected.`}
        actions={
          <Tooltip content="Refresh">
            <IconButton
              aria-label="Refresh marketplace listings"
              size="small"
              variant="transparent"
              onClick={() => void loadListings()}
              isLoading={isLoading}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      >
        <FilterPanel>
          <div className="flex flex-col gap-2 px-6 py-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="txt-compact-small h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2.5 text-ui-fg-base outline-none md:w-[180px]"
              >
                <option value="all">All statuses</option>
                <option value="pending_review">Pending review</option>
                <option value="active">Active</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                aria-label="Filter by category"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="txt-compact-small h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2.5 text-ui-fg-base outline-none md:w-[180px]"
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filter by seller verification"
                value={sellerVerificationFilter}
                onChange={(event) =>
                  setSellerVerificationFilter(
                    event.target.value as SellerVerificationFilter,
                  )
                }
                className="txt-compact-small h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2.5 text-ui-fg-base outline-none md:w-[180px]"
              >
                <option value="all">All sellers</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
            <div>
              <input
                aria-label="Search marketplace listings"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search"
                type="search"
                className="txt-compact-small h-8 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-2.5 text-ui-fg-base outline-none placeholder:text-ui-fg-muted md:w-[240px]"
              />
            </div>
          </div>
        </FilterPanel>

        {listings.length === 0 ? (
          <EmptyState
            title={
              isLoading ? "Loading marketplace listings..." : "No listings yet"
            }
            description="Seller submissions will appear here."
          />
        ) : filteredListings.length === 0 ? (
          <EmptyState
            title="No listings match"
            description="Adjust search, status, category, or seller verification filters."
          />
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Listing</Table.HeaderCell>
                <Table.HeaderCell>Seller</Table.HeaderCell>
                <Table.HeaderCell>Category</Table.HeaderCell>
                <Table.HeaderCell>Price</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Submitted</Table.HeaderCell>
                <Table.HeaderCell className="text-right">
                  Actions
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredListings.map((listing) => (
                <Table.Row key={listing.id}>
                  <Table.Cell>
                    <div className="flex max-w-[260px] items-center gap-x-3">
                      <ListingThumbnail
                        thumbnail={listing.thumbnail}
                        title={listing.title}
                      />
                      <span className="truncate">{listing.title}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="max-w-[180px] truncate">
                    {listing.seller?.display_name ?? "Unknown seller"}
                  </Table.Cell>
                  <Table.Cell className="max-w-[160px] truncate">
                    {listing.category ?? "No category"}
                  </Table.Cell>
                  <Table.Cell>{formatPrice(listing.price)}</Table.Cell>
                  <Table.Cell>
                    <StatusBadge color={statusColor[listing.status]}>
                      {statusLabel[listing.status]}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell>{formatDate(listing.created_at)}</Table.Cell>
                  <Table.Cell className="text-right">
                    <div className="flex justify-end gap-2">
                      {listing.status === "active" && (
                        <Tooltip content="View storefront">
                          <IconButton
                            aria-label={`View ${listing.title} on storefront`}
                            size="small"
                            variant="transparent"
                            asChild
                          >
                            <a
                              href={`${storefrontBase}/products/${listing.handle}`}
                            >
                              <EyeIcon />
                            </a>
                          </IconButton>
                        </Tooltip>
                      )}
                      <Button
                        size="small"
                        variant="transparent"
                        onClick={() => setSelectedListing(listing)}
                      >
                        Details
                      </Button>
                      <ListingActions
                        listing={listing}
                        isLoading={updatingId === listing.id}
                        onApprove={() => void updateStatus(listing, "active")}
                        onReject={() => setRejectListing(listing)}
                      />
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </OpsSection>

      <ListingDetailsDialog
        listing={selectedListing}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedListing(null)
          }
        }}
      />
      <RejectListingDialog
        listing={rejectListing}
        note={rejectListing ? (moderationNotes[rejectListing.id] ?? "") : ""}
        isLoading={rejectListing ? updatingId === rejectListing.id : false}
        onNoteChange={(value) => {
          if (!rejectListing) {
            return
          }

          setModerationNotes((current) => ({
            ...current,
            [rejectListing.id]: value,
          }))
        }}
        onOpenChange={(open) => {
          if (!open) {
            setRejectListing(null)
          }
        }}
        onConfirm={() => {
          if (rejectListing) {
            void updateStatus(rejectListing, "rejected")
          }
        }}
      />
    </div>
  )
}

const ListingActions = ({
  listing,
  isLoading,
  onApprove,
  onReject,
}: {
  listing: MarketplaceListing
  isLoading: boolean
  onApprove: () => void
  onReject: () => void
}) => (
  <DropdownMenu>
    <DropdownMenu.Trigger asChild>
      <Button size="small" variant="transparent" disabled={isLoading}>
        More
      </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end">
      <DropdownMenu.Item
        disabled={listing.status === "active"}
        onSelect={onApprove}
      >
        Approve listing
      </DropdownMenu.Item>
      <DropdownMenu.Item
        className="text-ui-fg-error"
        disabled={listing.status === "rejected"}
        onSelect={onReject}
      >
        Reject listing
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu>
)

const ListingThumbnail = ({
  thumbnail,
  title,
}: {
  thumbnail: string | null
  title: string
}) => (
  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-ui-border-base bg-ui-bg-subtle">
    {thumbnail ? (
      <img
        alt=""
        className="h-full w-full object-cover"
        src={thumbnail}
      />
    ) : (
      <Text className="text-ui-fg-muted" size="small">
        {title.charAt(0).toUpperCase()}
      </Text>
    )}
  </div>
)

const ListingDetailsDialog = ({
  listing,
  onOpenChange,
}: {
  listing: MarketplaceListing | null
  onOpenChange: (open: boolean) => void
}) => (
  <FocusModal open={Boolean(listing)} onOpenChange={onOpenChange}>
    <FocusModal.Content className="inset-auto left-1/2 top-1/2 h-auto max-h-[calc(100%-32px)] w-[calc(100%-32px)] max-w-[720px] -translate-x-1/2 -translate-y-1/2">
      <FocusModal.Header>
        <FocusModal.Title>Listing details</FocusModal.Title>
      </FocusModal.Header>
      {listing && (
        <FocusModal.Body className="overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-y-5">
            {listingImages(listing).length > 0 && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {listingImages(listing).map((imageUrl) => (
                  <div
                    key={imageUrl}
                    className="aspect-square overflow-hidden rounded-md border border-ui-border-base bg-ui-bg-subtle"
                  >
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      src={imageUrl}
                    />
                  </div>
                ))}
              </div>
            )}
            <div>
              <Text weight="plus">{listing.title}</Text>
              <Text className="mt-1 text-ui-fg-subtle" size="small">
                {listing.description || "No description"}
              </Text>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <DetailItem label="Seller">
                {listing.seller?.display_name ?? "Unknown seller"}
              </DetailItem>
              <DetailItem label="Seller contact">
                {listing.seller?.email ??
                  listing.seller?.phone ??
                  listing.seller?.location ??
                  "No contact"}
              </DetailItem>
              <DetailItem label="Price">
                <span className="text-ui-fg-error">
                  {formatPrice(listing.price)}
                </span>
              </DetailItem>
              <DetailItem label="Submitted">
                {formatDate(listing.created_at)}
              </DetailItem>
              {listingDetailRows(listing).map(([label, value]) => (
                <DetailItem key={label} label={label}>
                  {value}
                </DetailItem>
              ))}
            </div>
            {(listing.moderation_note || listing.reviewed_at) && (
              <div>
                <Text weight="plus">Moderation</Text>
                {listing.moderation_note && (
                  <Text className="mt-1 text-ui-fg-subtle" size="small">
                    {listing.moderation_note}
                  </Text>
                )}
                {formatDateTime(listing.reviewed_at) && (
                  <Text className="mt-1 text-ui-fg-subtle" size="small">
                    Reviewed {formatDateTime(listing.reviewed_at)}
                    {formatReviewer(listing)
                      ? ` by ${formatReviewer(listing)}`
                      : ""}
                  </Text>
                )}
              </div>
            )}
          </div>
        </FocusModal.Body>
      )}
    </FocusModal.Content>
  </FocusModal>
)

const DetailItem = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <div>
    <Text className="text-ui-fg-subtle" size="small">
      {label}
    </Text>
    <Text className="mt-1" size="small">
      {children}
    </Text>
  </div>
)

const RejectListingDialog = ({
  listing,
  note,
  isLoading,
  onNoteChange,
  onOpenChange,
  onConfirm,
}: {
  listing: MarketplaceListing | null
  note: string
  isLoading: boolean
  onNoteChange: (value: string) => void
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) => (
  <FocusModal open={Boolean(listing)} onOpenChange={onOpenChange}>
    <FocusModal.Content className="inset-auto left-1/2 top-1/2 h-auto max-h-[calc(100%-32px)] w-[calc(100%-32px)] max-w-[520px] -translate-x-1/2 -translate-y-1/2">
      <FocusModal.Header>
        <FocusModal.Title>Reject listing</FocusModal.Title>
      </FocusModal.Header>
      <FocusModal.Body className="px-6 py-5">
        <div className="flex flex-col gap-y-4">
          <div>
            <Text weight="plus">{listing?.title ?? "Listing"}</Text>
            <Text className="mt-1 text-ui-fg-subtle" size="small">
              This listing will stay hidden from the storefront. The seller will
              see the rejection reason in their listing dashboard.
            </Text>
          </div>
          <label className="flex flex-col gap-y-2">
            <Text className="text-ui-fg-subtle" size="small" weight="plus">
              Rejection reason
            </Text>
            <Textarea
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder="Explain what the seller needs to fix before resubmitting."
              rows={5}
            />
          </label>
        </div>
      </FocusModal.Body>
      <FocusModal.Footer>
        <FocusModal.Close asChild>
          <Button size="small" variant="secondary">
            Cancel
          </Button>
        </FocusModal.Close>
        <Button
          size="small"
          variant="danger"
          disabled={!note.trim()}
          isLoading={isLoading}
          onClick={onConfirm}
        >
          Confirm rejection
        </Button>
      </FocusModal.Footer>
    </FocusModal.Content>
  </FocusModal>
)

const EyeIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="16"
    viewBox="0 0 20 20"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.5 10s2.5-4.5 7.5-4.5 7.5 4.5 7.5 4.5-2.5 4.5-7.5 4.5S2.5 10 2.5 10Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
    <path
      d="M10 12.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
)

const RefreshIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="16"
    viewBox="0 0 24 24"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 7v5h-5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M4 17v-5h5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M6.1 9a7 7 0 0 1 11.6-2.6L20 8.7"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M17.9 15a7 7 0 0 1-11.6 2.6L4 15.3"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

const MarketplaceIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
    <path
      d="M3 8.5h14l-1.2-4.25A1.75 1.75 0 0 0 14.12 3H5.88A1.75 1.75 0 0 0 4.2 4.25L3 8.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M4.5 8.5V16h11V8.5M8 16v-4h4v4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
)

export const config = defineRouteConfig({
  label: "Marketplace",
  icon: MarketplaceIcon,
  rank: 44,
})

export default MarketplacePage
