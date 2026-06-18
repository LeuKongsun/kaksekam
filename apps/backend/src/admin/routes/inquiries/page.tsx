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

type AdminInquiry = {
  id: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string | null
  message: string
  status: "new" | "read" | "replied" | "archived"
  created_at: string
  replied_at: string | null
  product: {
    id: string
    title: string
    handle: string
    thumbnail: string | null
    listing?: {
      id: string
      status: string
    } | null
    seller?: {
      id: string
      display_name: string
      handle: string
      verification_status: "unverified" | "verified"
    } | null
  } | null
}

type InquiriesResponse = {
  inquiries: AdminInquiry[]
}

type InquiryStatusFilter = "all" | AdminInquiry["status"]
type SellerVerificationFilter = "all" | "verified" | "unverified"

const statusColor: Record<
  AdminInquiry["status"],
  "orange" | "blue" | "green" | "grey"
> = {
  new: "orange",
  read: "blue",
  replied: "green",
  archived: "grey",
}

const statusLabel: Record<AdminInquiry["status"], string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
  archived: "Archived",
}

const getAgeInDays = (createdAt: string) => {
  const elapsed = Date.now() - new Date(createdAt).getTime()

  return Math.max(0, Math.floor(elapsed / (1000 * 60 * 60 * 24)))
}

const formatInquiryAge = (createdAt: string) => {
  const days = getAgeInDays(createdAt)

  if (days === 0) {
    return "Today"
  }

  return `${days} day${days === 1 ? "" : "s"} old`
}

const InquiriesPage = () => {
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<InquiryStatusFilter>("new")
  const [sellerVerificationFilter, setSellerVerificationFilter] =
    useState<SellerVerificationFilter>("all")
  const [selectedInquiry, setSelectedInquiry] = useState<AdminInquiry | null>(
    null,
  )
  const counts = useMemo(
    () => ({
      new: inquiries.filter((inquiry) => inquiry.status === "new").length,
      read: inquiries.filter((inquiry) => inquiry.status === "read").length,
      replied: inquiries.filter((inquiry) => inquiry.status === "replied")
        .length,
      archived: inquiries.filter((inquiry) => inquiry.status === "archived")
        .length,
      stale: inquiries.filter(
        (inquiry) =>
          inquiry.status !== "replied" &&
          inquiry.status !== "archived" &&
          getAgeInDays(inquiry.created_at) >= 2,
      ).length,
      unverifiedSeller: inquiries.filter(
        (inquiry) =>
          inquiry.product?.seller?.verification_status === "unverified",
      ).length,
    }),
    [inquiries],
  )
  const filteredInquiries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return inquiries.filter((inquiry) => {
      const statusMatches =
        statusFilter === "all" || inquiry.status === statusFilter
      const verificationMatches =
        sellerVerificationFilter === "all" ||
        inquiry.product?.seller?.verification_status ===
          sellerVerificationFilter
      const searchable = [
        inquiry.buyer_name,
        inquiry.buyer_email,
        inquiry.buyer_phone,
        inquiry.message,
        inquiry.product?.title,
        inquiry.product?.handle,
        inquiry.product?.seller?.display_name,
        inquiry.product?.seller?.handle,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      const searchMatches =
        !normalizedSearch || searchable.includes(normalizedSearch)

      return statusMatches && verificationMatches && searchMatches
    })
  }, [inquiries, searchTerm, sellerVerificationFilter, statusFilter])

  const loadInquiries = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/admin/inquiries")

      if (!response.ok) {
        throw new Error("Could not load inquiries")
      }

      const data = (await response.json()) as InquiriesResponse
      setInquiries(data.inquiries)
    } catch (error) {
      toast.error("Unable to load inquiries", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateInquiryStatus = async (
    inquiry: AdminInquiry,
    status: AdminInquiry["status"],
  ) => {
    setUpdatingId(inquiry.id)

    try {
      const response = await fetch(`/admin/inquiries/${inquiry.id}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Could not update inquiry")
      }

      toast.success("Inquiry updated", {
        description: inquiry.product?.title ?? inquiry.buyer_name,
      })

      await loadInquiries()
    } catch (error) {
      toast.error("Unable to update inquiry", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setUpdatingId(null)
    }
  }

  useEffect(() => {
    void loadInquiries()
  }, [])

  return (
    <div className="flex flex-col gap-y-6">
      <OpsSection
        title="Marketplace inquiries"
        subtitle={`${counts.new} new, ${counts.read} read, ${counts.replied} replied, ${counts.archived} archived.`}
        actions={
          <Tooltip content="Refresh">
            <IconButton
              aria-label="Refresh marketplace inquiries"
              size="small"
              variant="transparent"
              onClick={() => void loadInquiries()}
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
                aria-label="Filter by inquiry status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as InquiryStatusFilter)
                }
                className="txt-compact-small h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2.5 text-ui-fg-base outline-none md:w-[180px]"
              >
                <option value="all">All statuses</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
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
                aria-label="Search inquiries"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search"
                type="search"
                className="txt-compact-small h-8 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-2.5 text-ui-fg-base outline-none placeholder:text-ui-fg-muted md:w-[240px]"
              />
            </div>
          </div>
        </FilterPanel>

        {inquiries.length === 0 ? (
          <EmptyState
            title={isLoading ? "Loading inquiries..." : "No inquiries yet"}
            description="Buyer messages from storefront listing pages will appear here."
          />
        ) : filteredInquiries.length === 0 ? (
          <EmptyState
            title="No inquiries match"
            description="Adjust search, inquiry status, or seller verification filters."
          />
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Buyer</Table.HeaderCell>
                <Table.HeaderCell>Listing</Table.HeaderCell>
                <Table.HeaderCell>Seller</Table.HeaderCell>
                <Table.HeaderCell>Age</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell className="text-right">
                  Actions
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredInquiries.map((inquiry) => (
                <Table.Row key={inquiry.id}>
                  <Table.Cell className="max-w-[180px] truncate">
                    {inquiry.buyer_name}
                  </Table.Cell>
                  <Table.Cell className="max-w-[260px] truncate">
                    {inquiry.product?.title ?? "Listing unavailable"}
                  </Table.Cell>
                  <Table.Cell className="max-w-[200px] truncate">
                    {inquiry.product?.seller?.display_name ?? "Unknown seller"}
                  </Table.Cell>
                  <Table.Cell
                    className={
                      inquiry.status !== "replied" &&
                      inquiry.status !== "archived" &&
                      getAgeInDays(inquiry.created_at) >= 2
                        ? "text-ui-fg-error"
                        : undefined
                    }
                  >
                    {formatInquiryAge(inquiry.created_at)}
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge color={statusColor[inquiry.status]}>
                      {statusLabel[inquiry.status]}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="small"
                        variant="transparent"
                        onClick={() => setSelectedInquiry(inquiry)}
                      >
                        Details
                      </Button>
                      <InquiryActions
                        inquiry={inquiry}
                        isLoading={updatingId === inquiry.id}
                        onUpdate={(status) =>
                          void updateInquiryStatus(inquiry, status)
                        }
                      />
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </OpsSection>
      <InquiryDetailsDialog
        inquiry={selectedInquiry}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedInquiry(null)
          }
        }}
      />
    </div>
  )
}

const InquiryActions = ({
  inquiry,
  isLoading,
  onUpdate,
}: {
  inquiry: AdminInquiry
  isLoading: boolean
  onUpdate: (status: AdminInquiry["status"]) => void
}) => (
  <DropdownMenu>
    <DropdownMenu.Trigger asChild>
      <Button size="small" variant="transparent" disabled={isLoading}>
        More
      </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end">
      <DropdownMenu.Item
        disabled={inquiry.status === "read"}
        onSelect={() => onUpdate("read")}
      >
        Mark as read
      </DropdownMenu.Item>
      <DropdownMenu.Item
        disabled={inquiry.status === "replied"}
        onSelect={() => onUpdate("replied")}
      >
        Mark as replied
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item
        disabled={inquiry.status === "archived"}
        onSelect={() => onUpdate("archived")}
      >
        Archive inquiry
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu>
)

const InquiryDetailsDialog = ({
  inquiry,
  onOpenChange,
}: {
  inquiry: AdminInquiry | null
  onOpenChange: (open: boolean) => void
}) => (
  <FocusModal open={Boolean(inquiry)} onOpenChange={onOpenChange}>
    <FocusModal.Content className="inset-auto left-1/2 top-1/2 h-auto max-h-[calc(100%-32px)] w-[calc(100%-32px)] max-w-[680px] -translate-x-1/2 -translate-y-1/2">
      <FocusModal.Header>
        <FocusModal.Title>Inquiry details</FocusModal.Title>
      </FocusModal.Header>
      {inquiry && (
        <FocusModal.Body className="overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-y-5">
            <div>
              <Text weight="plus">{inquiry.buyer_name}</Text>
              <Text className="mt-1 text-ui-fg-subtle" size="small">
                {inquiry.message}
              </Text>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <DetailItem label="Buyer email">
                {inquiry.buyer_email}
              </DetailItem>
              <DetailItem label="Buyer phone">
                {inquiry.buyer_phone ?? "None"}
              </DetailItem>
              <DetailItem label="Listing">
                {inquiry.product?.title ?? "Listing unavailable"}
              </DetailItem>
              <DetailItem label="Listing status">
                {inquiry.product?.listing?.status ?? "Unknown"}
              </DetailItem>
              <DetailItem label="Seller">
                {inquiry.product?.seller?.display_name ?? "Unknown seller"}
              </DetailItem>
              <DetailItem label="Seller handle">
                {inquiry.product?.seller?.handle
                  ? `@${inquiry.product.seller.handle}`
                  : "None"}
              </DetailItem>
              <DetailItem label="Seller verification">
                {inquiry.product?.seller?.verification_status ?? "Unknown"}
              </DetailItem>
              <DetailItem label="Received">
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(inquiry.created_at))}
              </DetailItem>
              {inquiry.replied_at && (
                <DetailItem label="Replied">
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(inquiry.replied_at))}
                </DetailItem>
              )}
            </div>
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
  label: "Marketplace inquiries",
  rank: 47,
})

export default InquiriesPage
