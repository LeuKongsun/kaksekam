import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Button,
  Container,
  Heading,
  StatusBadge,
  Table,
  Text,
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

const statusColor: Record<ModerationListing["status"], "orange" | "green" | "red"> = {
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending_review")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sellerVerificationFilter, setSellerVerificationFilter] =
    useState<SellerVerificationFilter>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [moderationNotes, setModerationNotes] = useState<Record<string, string>>(
    {}
  )

  const listingCounts = useMemo(
    () => ({
      pending_review: listings.filter(
        (listing) => listing.status === "pending_review"
      ).length,
      active: listings.filter((listing) => listing.status === "active").length,
      rejected: listings.filter((listing) => listing.status === "rejected")
        .length,
      unverified_sellers: listings.filter(
        (listing) => listing.seller?.verification_status !== "verified"
      ).length,
    }),
    [listings]
  )
  const categories = useMemo(
    () =>
      Array.from(
        new Set(listings.map((listing) => listing.category).filter(Boolean))
      ).sort() as string[],
    [listings]
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
        }, {})
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
    status: "active" | "rejected"
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
        throw new Error(`Could not ${status === "active" ? "approve" : "reject"} listing`)
      }

      toast.success(
        status === "active" ? "Listing approved" : "Listing rejected",
        {
          description: listing.title,
        }
      )

      await loadListings()
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
    verificationStatus: "unverified" | "verified"
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
        }
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
        }
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
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Listing moderation</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            {listingCounts.pending_review} pending review, {listingCounts.active}{" "}
            active, {listingCounts.rejected} rejected
          </Text>
        </div>
        <Button
          size="small"
          variant="secondary"
          onClick={() => void loadListings()}
          isLoading={isLoading}
        >
          Refresh
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-4">
        <QueueCard label="Pending review" value={listingCounts.pending_review} />
        <QueueCard label="Active" value={listingCounts.active} />
        <QueueCard label="Rejected" value={listingCounts.rejected} />
        <QueueCard
          label="Unverified sellers"
          value={listingCounts.unverified_sellers}
        />
      </div>
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
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
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
                event.target.value as SellerVerificationFilter
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

      {listings.length === 0 ? (
        <div className="px-6 py-10">
          <Text className="text-ui-fg-subtle">
            {isLoading ? "Loading listings..." : "No listings to moderate."}
          </Text>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="px-6 py-10">
          <Text className="text-ui-fg-subtle">
            No listings match the current filters.
          </Text>
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Listing</Table.HeaderCell>
              <Table.HeaderCell>Seller</Table.HeaderCell>
              <Table.HeaderCell>Price</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
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
                      <Text className="line-clamp-2 text-ui-fg-subtle" size="small">
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
                      <Text>{listing.seller?.display_name ?? "Unknown seller"}</Text>
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
                  <div className="flex min-w-[260px] flex-col gap-y-2">
                    {listing.seller && (
                      <div className="flex justify-end gap-x-2">
                        <Button
                          size="small"
                          variant="secondary"
                          disabled={
                            listing.seller.verification_status === "verified"
                          }
                          isLoading={updatingId === listing.id}
                          onClick={() =>
                            void updateSellerVerification(listing, "verified")
                          }
                        >
                          Verify seller
                        </Button>
                        <Button
                          size="small"
                          variant="secondary"
                          disabled={
                            listing.seller.verification_status === "unverified"
                          }
                          isLoading={updatingId === listing.id}
                          onClick={() =>
                            void updateSellerVerification(listing, "unverified")
                          }
                        >
                          Unverify
                        </Button>
                      </div>
                    )}
                    <textarea
                      value={moderationNotes[listing.id] ?? ""}
                      onChange={(event) =>
                        setModerationNotes((current) => ({
                          ...current,
                          [listing.id]: event.target.value,
                        }))
                      }
                      placeholder="Rejection reason"
                      rows={2}
                      className="w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-ui-fg-base outline-none"
                    />
                    <div className="flex justify-end gap-x-2">
                      <Button
                        size="small"
                        variant="secondary"
                        disabled={listing.status === "active"}
                        isLoading={updatingId === listing.id}
                        onClick={() => void updateStatus(listing, "active")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="danger"
                        disabled={listing.status === "rejected"}
                        isLoading={updatingId === listing.id}
                        onClick={() => void updateStatus(listing, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Container>
  )
}

const QueueCard = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-md border border-ui-border-base p-4">
    <Text className="text-ui-fg-subtle" size="small">
      {label}
    </Text>
    <Text className="mt-2 text-ui-fg-base" size="xlarge" weight="plus">
      {value}
    </Text>
  </div>
)

export const config = defineRouteConfig({
  label: "Listing moderation",
  rank: 45,
})

export default ListingModerationPage
