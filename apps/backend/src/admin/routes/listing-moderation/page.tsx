import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  EmptyState,
  FilterPanel,
  OpsPage,
  OpsSection,
  SignalCard,
} from "../../components/marketplace-ops"
import {
  Button,
  DropdownMenu,
  FocusModal,
  StatusBadge,
  Table,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"

type ModerationListing = {
  id: string
  product_id: string
  title: string
  handle: string
  description: string | null
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
  availability: string | null
  condition: string | null
  contact_preference: string | null
  variety: string | null
  production_method: string | null
  harvest_date: string | null
  breed: string | null
  age: string | null
  sex: string | null
  health_notes: string | null
  brand: string | null
  equipment_model: string | null
  year: string | null
  pack_size: string | null
  expiry_date: string | null
  service_area: string | null
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

type ListingModerationResponse = {
  listings: ModerationListing[]
}

type StatusFilter = "all" | ModerationListing["status"]
type SellerVerificationFilter = "all" | "verified" | "unverified"

const statusColor: Record<
  ModerationListing["status"],
  "orange" | "green" | "red"
> = {
  pending_review: "orange",
  active: "green",
  rejected: "red",
}

const statusLabel: Record<ModerationListing["status"], string> = {
  pending_review: "Pending review",
  active: "Active",
  rejected: "Rejected",
}

const formatPrice = (price: ModerationListing["price"]) => {
  if (!price?.calculated_amount) {
    return "No price"
  }

  return `${price.calculated_amount} ${(
    price.currency_code ?? ""
  ).toUpperCase()}`
}

const formatReviewedAt = (value: string | null) => {
  if (!value) {
    return null
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

const formatSubmittedAt = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value))

const formatReviewer = (listing: ModerationListing) => {
  if (!listing.reviewer) {
    return listing.reviewer_id
  }

  const name = [listing.reviewer.first_name, listing.reviewer.last_name]
    .filter(Boolean)
    .join(" ")

  return listing.reviewer.email ?? (name || listing.reviewer.id)
}

const formatListingDetails = (listing: ModerationListing) =>
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

const ListingModerationPage = () => {
  const [listings, setListings] = useState<ModerationListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("pending_review")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sellerVerificationFilter, setSellerVerificationFilter] =
    useState<SellerVerificationFilter>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [rejectListing, setRejectListing] = useState<ModerationListing | null>(
    null,
  )
  const [moderationNotes, setModerationNotes] = useState<
    Record<string, string>
  >({})

  const listingCounts = useMemo(
    () => ({
      pending_review: listings.filter(
        (listing) => listing.status === "pending_review",
      ).length,
      active: listings.filter((listing) => listing.status === "active").length,
      rejected: listings.filter((listing) => listing.status === "rejected")
        .length,
      unverified_sellers: listings.filter(
        (listing) => listing.seller?.verification_status !== "verified",
      ).length,
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
        throw new Error("Could not load listings")
      }

      const data = (await response.json()) as ListingModerationResponse
      setListings(data.listings)
      setModerationNotes(
        data.listings.reduce<Record<string, string>>((acc, listing) => {
          acc[listing.id] = listing.moderation_note ?? ""
          return acc
        }, {}),
      )
    } catch (error) {
      toast.error("Unable to load listings", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (
    listing: ModerationListing,
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

  const updateSellerVerification = async (
    listing: ModerationListing,
    verificationStatus: "unverified" | "verified",
  ) => {
    if (!listing.seller?.id) {
      toast.error("Seller not found")
      return
    }

    setUpdatingId(listing.id)

    try {
      const response = await fetch(
        `/admin/sellers/${listing.seller.id}/verification`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            verification_status: verificationStatus,
          }),
        },
      )

      if (!response.ok) {
        throw new Error("Could not update seller verification")
      }

      toast.success(
        verificationStatus === "verified"
          ? "Seller verified"
          : "Seller verification removed",
        {
          description: listing.seller.display_name,
        },
      )

      await loadListings()
    } catch (error) {
      toast.error("Unable to update seller", {
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
    <OpsPage
      title="Listing moderation"
      subtitle={`${listingCounts.pending_review} pending review, ${listingCounts.active} active, ${listingCounts.rejected} rejected.`}
      actions={
        <Button
          size="small"
          variant="secondary"
          onClick={() => void loadListings()}
          isLoading={isLoading}
        >
          Refresh
        </Button>
      }
    >
      <OpsSection>
        <div className="grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-4">
          <SignalCard
            label="Pending review"
            value={listingCounts.pending_review}
            tone={listingCounts.pending_review > 0 ? "attention" : "neutral"}
            detail="Hidden until approved"
          />
          <SignalCard
            label="Active"
            value={listingCounts.active}
            tone="success"
            detail="Visible on storefront"
          />
          <SignalCard
            label="Rejected"
            value={listingCounts.rejected}
            tone={listingCounts.rejected > 0 ? "danger" : "neutral"}
          />
          <SignalCard
            label="Unverified sellers"
            value={listingCounts.unverified_sellers}
            tone={
              listingCounts.unverified_sellers > 0 ? "attention" : "neutral"
            }
          />
        </div>
      </OpsSection>

      <OpsSection
        title="Review queue"
        subtitle="Approve good listings, reject incomplete ones, and verify sellers without leaving the queue."
      >
        <FilterPanel>
          <div className="grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-[1fr_180px_180px_180px]">
            <label className="flex flex-col gap-y-1">
              <Text className="text-ui-fg-subtle" size="small">
                Search
              </Text>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Listing, seller, location"
                className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-ui-fg-base outline-none"
              />
            </label>
            <label className="flex flex-col gap-y-1">
              <Text className="text-ui-fg-subtle" size="small">
                Status
              </Text>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-ui-fg-base outline-none"
              >
                <option value="all">All statuses</option>
                <option value="pending_review">Pending review</option>
                <option value="active">Active</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
            <label className="flex flex-col gap-y-1">
              <Text className="text-ui-fg-subtle" size="small">
                Category
              </Text>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-ui-fg-base outline-none"
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-y-1">
              <Text className="text-ui-fg-subtle" size="small">
                Seller verification
              </Text>
              <select
                value={sellerVerificationFilter}
                onChange={(event) =>
                  setSellerVerificationFilter(
                    event.target.value as SellerVerificationFilter,
                  )
                }
                className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-ui-fg-base outline-none"
              >
                <option value="all">All sellers</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </label>
          </div>
        </FilterPanel>

        {listings.length === 0 ? (
          <EmptyState
            title={
              isLoading ? "Loading listings..." : "No listings to moderate"
            }
            description="Seller submissions will land here before they are published to the storefront."
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
                <Table.HeaderCell>Price</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell className="text-right">
                  Actions
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredListings.map((listing) => (
                <Table.Row key={listing.id}>
                  <Table.Cell>
                    <div className="flex max-w-[360px] flex-col gap-y-1">
                      <Text weight="plus">{listing.title}</Text>
                      <Text className="text-ui-fg-subtle" size="small">
                        Submitted {formatSubmittedAt(listing.created_at)}
                      </Text>
                      {listing.description && (
                        <Text
                          className="line-clamp-2 text-ui-fg-subtle"
                          size="small"
                        >
                          {listing.description}
                        </Text>
                      )}
                      {listing.moderation_note && (
                        <Text className="text-ui-fg-subtle" size="small">
                          Note: {listing.moderation_note}
                        </Text>
                      )}
                      {formatReviewedAt(listing.reviewed_at) && (
                        <Text className="text-ui-fg-subtle" size="small">
                          Reviewed {formatReviewedAt(listing.reviewed_at)}
                          {formatReviewer(listing)
                            ? ` by ${formatReviewer(listing)}`
                            : ""}
                        </Text>
                      )}
                      {formatListingDetails(listing).length > 0 && (
                        <Text className="text-ui-fg-subtle" size="small">
                          {formatListingDetails(listing).join(" | ")}
                        </Text>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-col gap-y-1">
                      <div className="flex items-center gap-x-2">
                        <Text>
                          {listing.seller?.display_name ?? "Unknown seller"}
                        </Text>
                        {listing.seller?.verification_status === "verified" && (
                          <StatusBadge color="green">Verified</StatusBadge>
                        )}
                      </div>
                      <Text className="text-ui-fg-subtle" size="small">
                        {listing.seller?.email ??
                          listing.seller?.phone ??
                          listing.seller?.location ??
                          "No contact"}
                      </Text>
                    </div>
                  </Table.Cell>
                  <Table.Cell>{formatPrice(listing.price)}</Table.Cell>
                  <Table.Cell>
                    <StatusBadge color={statusColor[listing.status]}>
                      {statusLabel[listing.status]}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell>
                    <ModerationActions
                      listing={listing}
                      isLoading={updatingId === listing.id}
                      onApprove={() => void updateStatus(listing, "active")}
                      onReject={() => setRejectListing(listing)}
                      onVerifySeller={() =>
                        void updateSellerVerification(listing, "verified")
                      }
                      onUnverifySeller={() =>
                        void updateSellerVerification(listing, "unverified")
                      }
                    />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </OpsSection>
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
    </OpsPage>
  )
}

const ModerationActions = ({
  listing,
  isLoading,
  onApprove,
  onReject,
  onVerifySeller,
  onUnverifySeller,
}: {
  listing: ModerationListing
  isLoading: boolean
  onApprove: () => void
  onReject: () => void
  onVerifySeller: () => void
  onUnverifySeller: () => void
}) => (
  <div className="flex min-w-[168px] justify-end gap-2">
    <Button
      size="small"
      variant="secondary"
      disabled={listing.status === "active"}
      isLoading={isLoading}
      onClick={onApprove}
    >
      Approve
    </Button>
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button size="small" variant="transparent" disabled={isLoading}>
          More
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item
          className="text-ui-fg-error"
          disabled={listing.status === "rejected"}
          onSelect={onReject}
        >
          Reject listing
        </DropdownMenu.Item>
        {listing.seller && (
          <>
            <DropdownMenu.Separator />
            <DropdownMenu.Label>Seller trust</DropdownMenu.Label>
            <DropdownMenu.Item
              disabled={listing.seller.verification_status === "verified"}
              onSelect={onVerifySeller}
            >
              Verify seller
            </DropdownMenu.Item>
            <DropdownMenu.Item
              disabled={listing.seller.verification_status === "unverified"}
              onSelect={onUnverifySeller}
            >
              Remove verification
            </DropdownMenu.Item>
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
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
  listing: ModerationListing | null
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

export const config = defineRouteConfig({
  label: "Listing moderation",
  rank: 45,
})

export default ListingModerationPage
