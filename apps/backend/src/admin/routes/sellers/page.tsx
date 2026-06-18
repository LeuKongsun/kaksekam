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
  Tooltip,
  toast,
} from "@medusajs/ui"
import { ReactNode, useEffect, useMemo, useState } from "react"

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
  const [selectedSeller, setSelectedSeller] = useState<AdminSeller | null>(null)

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
    <div className="flex flex-col gap-y-6">
      <OpsSection
        title="Marketplace sellers"
        subtitle={`${sellerCounts.active} active, ${sellerCounts.verified} verified, ${sellerCounts.suspended} suspended.`}
        actions={
          <Tooltip content="Refresh">
            <IconButton
              aria-label="Refresh marketplace sellers"
              size="small"
              variant="transparent"
              onClick={() => void loadSellers()}
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
                aria-label="Filter by seller status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as SellerStatusFilter)
                }
                className="txt-compact-small h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2.5 text-ui-fg-base outline-none md:w-[180px]"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
              <select
                aria-label="Filter by verification"
                value={verificationFilter}
                onChange={(event) =>
                  setVerificationFilter(
                    event.target.value as VerificationFilter,
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
                aria-label="Search sellers"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search"
                type="search"
                className="txt-compact-small h-8 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-2.5 text-ui-fg-base outline-none placeholder:text-ui-fg-muted md:w-[240px]"
              />
            </div>
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
                <Table.HeaderCell>Handle</Table.HeaderCell>
                <Table.HeaderCell>Contact</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Verification</Table.HeaderCell>
                <Table.HeaderCell>Listings</Table.HeaderCell>
                <Table.HeaderCell className="text-right">
                  Actions
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredSellers.map((seller) => (
                <Table.Row key={seller.id}>
                  <Table.Cell className="max-w-[220px] truncate">
                    {seller.display_name}
                  </Table.Cell>
                  <Table.Cell className="max-w-[180px] truncate">
                    @{seller.handle}
                  </Table.Cell>
                  <Table.Cell className="max-w-[220px] truncate">
                    {seller.email ?? seller.phone ?? seller.location ?? "No contact"}
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge color={statusColor[seller.status]}>
                      {seller.status === "active" ? "Active" : "Suspended"}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge
                      color={
                        seller.verification_status === "verified"
                          ? "green"
                          : "grey"
                      }
                    >
                      {seller.verification_status === "verified"
                        ? "Verified"
                        : "Unverified"}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell>
                    {seller.listing_stats.active} active /{" "}
                    {seller.listing_stats.total} total
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="small"
                        variant="transparent"
                        onClick={() => setSelectedSeller(seller)}
                      >
                        Details
                      </Button>
                      <SellerActions
                        seller={seller}
                        isLoading={updatingId === seller.id}
                        onUpdate={(update) => void updateSeller(seller, update)}
                      />
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </OpsSection>
      <SellerDetailsDialog
        seller={selectedSeller}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSeller(null)
          }
        }}
      />
    </div>
  )
}

const SellerActions = ({
  seller,
  isLoading,
  onUpdate,
}: {
  seller: AdminSeller
  isLoading: boolean
  onUpdate: (
    update: Pick<Partial<AdminSeller>, "status" | "verification_status">,
  ) => void
}) => (
  <DropdownMenu>
    <DropdownMenu.Trigger asChild>
      <Button size="small" variant="transparent" disabled={isLoading}>
        More
      </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end">
      <DropdownMenu.Item
        disabled={seller.verification_status === "verified"}
        onSelect={() => onUpdate({ verification_status: "verified" })}
      >
        Verify seller
      </DropdownMenu.Item>
      <DropdownMenu.Item
        disabled={seller.verification_status === "unverified"}
        onSelect={() => onUpdate({ verification_status: "unverified" })}
      >
        Remove verification
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item
        className={seller.status === "active" ? "text-ui-fg-error" : undefined}
        onSelect={() =>
          onUpdate({
            status: seller.status === "active" ? "suspended" : "active",
          })
        }
      >
        {seller.status === "active" ? "Suspend seller" : "Reactivate seller"}
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu>
)

const SellerDetailsDialog = ({
  seller,
  onOpenChange,
}: {
  seller: AdminSeller | null
  onOpenChange: (open: boolean) => void
}) => (
  <FocusModal open={Boolean(seller)} onOpenChange={onOpenChange}>
    <FocusModal.Content className="inset-auto left-1/2 top-1/2 h-auto max-h-[calc(100%-32px)] w-[calc(100%-32px)] max-w-[680px] -translate-x-1/2 -translate-y-1/2">
      <FocusModal.Header>
        <FocusModal.Title>Seller details</FocusModal.Title>
      </FocusModal.Header>
      {seller && (
        <FocusModal.Body className="overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-y-5">
            <div>
              <Text weight="plus">{seller.display_name}</Text>
              <Text className="mt-1 text-ui-fg-subtle" size="small">
                @{seller.handle}
              </Text>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <DetailItem label="Email">{seller.email ?? "None"}</DetailItem>
              <DetailItem label="Phone">{seller.phone ?? "None"}</DetailItem>
              <DetailItem label="Location">
                {seller.location ?? "None"}
              </DetailItem>
              <DetailItem label="Status">{seller.status}</DetailItem>
              <DetailItem label="Verification">
                {seller.verification_status}
              </DetailItem>
              <DetailItem label="Created">
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: "medium",
                }).format(new Date(seller.created_at))}
              </DetailItem>
              <DetailItem label="Listings">
                {seller.listing_stats.active} active,{" "}
                {seller.listing_stats.pending} pending,{" "}
                {seller.listing_stats.rejected} rejected,{" "}
                {seller.listing_stats.total} total
              </DetailItem>
              <DetailItem label="Inquiries">
                {seller.inquiry_stats.total} total,{" "}
                {seller.inquiry_stats.replied} replied,{" "}
                {seller.inquiry_stats.reply_rate === null
                  ? "no reply history"
                  : `${seller.inquiry_stats.reply_rate}% reply rate`}
              </DetailItem>
            </div>
            {seller.bio && (
              <div>
                <Text className="text-ui-fg-subtle" size="small">
                  Bio
                </Text>
                <Text className="mt-1" size="small">
                  {seller.bio}
                </Text>
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

export const config = defineRouteConfig({
  label: "Marketplace sellers",
  rank: 46,
})

export default SellersPage
