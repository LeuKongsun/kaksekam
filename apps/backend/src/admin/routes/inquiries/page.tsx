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

const InquiriesPage = () => {
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<InquiryStatusFilter>("new")
  const [sellerVerificationFilter, setSellerVerificationFilter] =
    useState<SellerVerificationFilter>("all")
  const counts = useMemo(
    () => ({
      new: inquiries.filter((inquiry) => inquiry.status === "new").length,
      replied: inquiries.filter((inquiry) => inquiry.status === "replied").length,
      archived: inquiries.filter((inquiry) => inquiry.status === "archived")
        .length,
    }),
    [inquiries]
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
    status: AdminInquiry["status"]
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
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Marketplace inquiries</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            {counts.new} new, {counts.replied} replied, {counts.archived} archived
          </Text>
        </div>
        <Button
          size="small"
          variant="secondary"
          onClick={() => void loadInquiries()}
          isLoading={isLoading}
        >
          Refresh
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-[1fr_180px_180px]">
        <label className="flex flex-col gap-y-1">
          <Text className="text-ui-fg-subtle" size="small">
            Search
          </Text>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buyer, seller, listing, message"
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
              setStatusFilter(event.target.value as InquiryStatusFilter)
            }
            className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-ui-fg-base outline-none"
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
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

      {inquiries.length === 0 ? (
        <div className="px-6 py-10">
          <Text className="text-ui-fg-subtle">
            {isLoading ? "Loading inquiries..." : "No inquiries yet."}
          </Text>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="px-6 py-10">
          <Text className="text-ui-fg-subtle">
            No inquiries match the current filters.
          </Text>
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Inquiry</Table.HeaderCell>
              <Table.HeaderCell>Listing</Table.HeaderCell>
              <Table.HeaderCell>Seller</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredInquiries.map((inquiry) => (
              <Table.Row key={inquiry.id}>
                <Table.Cell>
                  <div className="flex max-w-[360px] flex-col gap-y-1">
                    <Text weight="plus">{inquiry.buyer_name}</Text>
                    <Text className="text-ui-fg-subtle" size="small">
                      {inquiry.buyer_email}
                      {inquiry.buyer_phone ? ` | ${inquiry.buyer_phone}` : ""}
                    </Text>
                    <Text className="line-clamp-2 text-ui-fg-subtle" size="small">
                      {inquiry.message}
                    </Text>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex max-w-[260px] flex-col gap-y-1">
                    <Text>{inquiry.product?.title ?? "Listing unavailable"}</Text>
                    <Text className="text-ui-fg-subtle" size="small">
                      {inquiry.product?.listing?.status ?? "Unknown status"}
                    </Text>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex flex-col gap-y-1">
                    <div className="flex items-center gap-x-2">
                      <Text>
                        {inquiry.product?.seller?.display_name ??
                          "Unknown seller"}
                      </Text>
                      {inquiry.product?.seller?.verification_status ===
                        "verified" && (
                        <StatusBadge color="green">Verified</StatusBadge>
                      )}
                    </div>
                    {inquiry.product?.seller?.handle && (
                      <Text className="text-ui-fg-subtle" size="small">
                        @{inquiry.product.seller.handle}
                      </Text>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <StatusBadge color={statusColor[inquiry.status]}>
                    {statusLabel[inquiry.status]}
                  </StatusBadge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex min-w-[260px] justify-end gap-x-2">
                    <Button
                      size="small"
                      variant="secondary"
                      disabled={inquiry.status === "read"}
                      isLoading={updatingId === inquiry.id}
                      onClick={() => void updateInquiryStatus(inquiry, "read")}
                    >
                      Read
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      disabled={inquiry.status === "replied"}
                      isLoading={updatingId === inquiry.id}
                      onClick={() =>
                        void updateInquiryStatus(inquiry, "replied")
                      }
                    >
                      Replied
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      disabled={inquiry.status === "archived"}
                      isLoading={updatingId === inquiry.id}
                      onClick={() =>
                        void updateInquiryStatus(inquiry, "archived")
                      }
                    >
                      Archive
                    </Button>
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

export const config = defineRouteConfig({
  label: "Marketplace inquiries",
  rank: 47,
})

export default InquiriesPage
