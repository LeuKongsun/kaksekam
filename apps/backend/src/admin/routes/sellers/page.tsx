import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  EmptyState,
  FilterPanel,
  OpsPage,
  OpsSection,
  SignalCard,
} from "../../components/marketplace-ops"
import { Button, StatusBadge, Table, Text, toast } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"

type AdminSeller = {
  id: string
  display_name: string
  handle: string
  email: string | null
  phone: string | null
  location: string | null
  bio: string | null
  status: "active" | "suspended"
  verification_status: "unverified" | "verified"
  created_at: string
  listing_stats: {
    total: number
    active: number
    pending: number
    rejected: number
  }
  inquiry_stats: {
    total: number
    replied: number
    reply_rate: number | null
  }
}

type SellersResponse = {
  sellers: AdminSeller[]
}

type SellerStatusFilter = "all" | AdminSeller["status"]
type VerificationFilter = "all" | AdminSeller["verification_status"]

const statusColor: Record<AdminSeller["status"], "green" | "red"> = {
  active: "green",
  suspended: "red",
}

const SellersPage = () => {
  const [sellers, setSellers] = useState<AdminSeller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<SellerStatusFilter>("all")
  const [verificationFilter, setVerificationFilter] =
    useState<VerificationFilter>("all")

  const sellerCounts = useMemo(
    () => ({
      active: sellers.filter((seller) => seller.status === "active").length,
      suspended: sellers.filter((seller) => seller.status === "suspended")
        .length,
      verified: sellers.filter(
        (seller) => seller.verification_status === "verified",
      ).length,
      unverified: sellers.filter(
        (seller) => seller.verification_status === "unverified",
      ).length,
      withPendingListings: sellers.filter(
        (seller) => seller.listing_stats.pending > 0,
      ).length,
      lowReplyRate: sellers.filter(
        (seller) =>
          seller.inquiry_stats.reply_rate !== null &&
          seller.inquiry_stats.reply_rate < 50,
      ).length,
    }),
    [sellers],
  )
  const filteredSellers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return sellers.filter((seller) => {
      const statusMatches =
        statusFilter === "all" || seller.status === statusFilter
      const verificationMatches =
        verificationFilter === "all" ||
        seller.verification_status === verificationFilter
      const searchable = [
        seller.display_name,
        seller.handle,
        seller.email,
        seller.phone,
        seller.location,
        seller.bio,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      const searchMatches =
        !normalizedSearch || searchable.includes(normalizedSearch)

      return statusMatches && verificationMatches && searchMatches
    })
  }, [searchTerm, sellers, statusFilter, verificationFilter])

  const loadSellers = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/admin/sellers")

      if (!response.ok) {
        throw new Error("Could not load sellers")
      }

      const data = (await response.json()) as SellersResponse
      setSellers(data.sellers)
    } catch (error) {
      toast.error("Unable to load sellers", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateSeller = async (
    seller: AdminSeller,
    update: Pick<Partial<AdminSeller>, "status" | "verification_status">,
  ) => {
    setUpdatingId(seller.id)

    try {
      const response = await fetch(`/admin/sellers/${seller.id}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(update),
      })

      if (!response.ok) {
        throw new Error("Could not update seller")
      }

      toast.success("Seller updated", {
        description: seller.display_name,
      })

      await loadSellers()
    } catch (error) {
      toast.error("Unable to update seller", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setUpdatingId(null)
    }
  }

  useEffect(() => {
    void loadSellers()
  }, [])

  return (
    <OpsPage
      title="Marketplace sellers"
      subtitle={`${sellerCounts.active} active, ${sellerCounts.verified} verified, ${sellerCounts.suspended} suspended.`}
      actions={
        <Button
          size="small"
          variant="secondary"
          onClick={() => void loadSellers()}
          isLoading={isLoading}
        >
          Refresh
        </Button>
      }
    >
      <OpsSection>
        <div className="grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-4">
          <SignalCard
            label="Active sellers"
            value={sellerCounts.active}
            tone="success"
          />
          <SignalCard
            label="Unverified"
            value={sellerCounts.unverified}
            tone={sellerCounts.unverified > 0 ? "attention" : "neutral"}
          />
          <SignalCard
            label="Pending listings"
            value={sellerCounts.withPendingListings}
            detail="Need moderation"
            tone={
              sellerCounts.withPendingListings > 0 ? "attention" : "neutral"
            }
          />
          <SignalCard
            label="Low reply rate"
            value={sellerCounts.lowReplyRate}
            detail="Below 50%"
            tone={sellerCounts.lowReplyRate > 0 ? "danger" : "neutral"}
          />
        </div>
      </OpsSection>

      <OpsSection
        title="Seller trust desk"
        subtitle="Verify credible sellers, watch response quality, and suspend accounts that should not trade."
      >
        <FilterPanel>
          <div className="grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-[1fr_180px_180px]">
            <label className="flex flex-col gap-y-1">
              <Text className="text-ui-fg-subtle" size="small">
                Search
              </Text>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Seller, handle, contact, location"
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
                  setStatusFilter(event.target.value as SellerStatusFilter)
                }
                className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-ui-fg-base outline-none"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </label>
            <label className="flex flex-col gap-y-1">
              <Text className="text-ui-fg-subtle" size="small">
                Verification
              </Text>
              <select
                value={verificationFilter}
                onChange={(event) =>
                  setVerificationFilter(
                    event.target.value as VerificationFilter,
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

        {sellers.length === 0 ? (
          <EmptyState
            title={isLoading ? "Loading sellers..." : "No sellers yet"}
            description="Seller profiles will appear once customers create marketplace listings or profiles."
          />
        ) : filteredSellers.length === 0 ? (
          <EmptyState
            title="No sellers match"
            description="Adjust the seller search, account status, or verification filters."
          />
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Seller</Table.HeaderCell>
                <Table.HeaderCell>Listings</Table.HeaderCell>
                <Table.HeaderCell>Inquiries</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell className="text-right">
                  Actions
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredSellers.map((seller) => (
                <Table.Row key={seller.id}>
                  <Table.Cell>
                    <div className="flex max-w-[360px] flex-col gap-y-1">
                      <div className="flex items-center gap-x-2">
                        <Text weight="plus">{seller.display_name}</Text>
                        {seller.verification_status === "verified" && (
                          <StatusBadge color="green">Verified</StatusBadge>
                        )}
                      </div>
                      <Text className="text-ui-fg-subtle" size="small">
                        @{seller.handle}
                      </Text>
                      <Text className="text-ui-fg-subtle" size="small">
                        {seller.email ??
                          seller.phone ??
                          seller.location ??
                          "No contact"}
                      </Text>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small">
                      {seller.listing_stats.active} active /{" "}
                      {seller.listing_stats.total} total
                    </Text>
                    <Text className="text-ui-fg-subtle" size="small">
                      {seller.listing_stats.pending} pending,{" "}
                      {seller.listing_stats.rejected} rejected
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small">
                      {seller.inquiry_stats.total} received
                    </Text>
                    <Text className="text-ui-fg-subtle" size="small">
                      {seller.inquiry_stats.reply_rate === null
                        ? "No reply history"
                        : `${seller.inquiry_stats.reply_rate}% reply rate`}
                    </Text>
                    {seller.inquiry_stats.reply_rate !== null &&
                      seller.inquiry_stats.reply_rate < 50 && (
                        <Text className="text-ui-fg-subtle" size="small">
                          Needs response follow-up
                        </Text>
                      )}
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge color={statusColor[seller.status]}>
                      {seller.status === "active" ? "Active" : "Suspended"}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex min-w-[260px] justify-end gap-x-2">
                      <Button
                        size="small"
                        variant="secondary"
                        disabled={seller.verification_status === "verified"}
                        isLoading={updatingId === seller.id}
                        onClick={() =>
                          void updateSeller(seller, {
                            verification_status: "verified",
                          })
                        }
                      >
                        Verify
                      </Button>
                      <Button
                        size="small"
                        variant="secondary"
                        disabled={seller.verification_status === "unverified"}
                        isLoading={updatingId === seller.id}
                        onClick={() =>
                          void updateSeller(seller, {
                            verification_status: "unverified",
                          })
                        }
                      >
                        Unverify
                      </Button>
                      <Button
                        size="small"
                        variant={
                          seller.status === "active" ? "danger" : "secondary"
                        }
                        isLoading={updatingId === seller.id}
                        onClick={() =>
                          void updateSeller(seller, {
                            status:
                              seller.status === "active"
                                ? "suspended"
                                : "active",
                          })
                        }
                      >
                        {seller.status === "active" ? "Suspend" : "Reactivate"}
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </OpsSection>
    </OpsPage>
  )
}

export const config = defineRouteConfig({
  label: "Marketplace sellers",
  rank: 46,
})

export default SellersPage
