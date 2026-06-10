import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  EmptyState,
  OpsPage,
  OpsSection,
  SignalCard,
} from "../../components/marketplace-ops"
import { Button, Heading, StatusBadge, Table, Text, toast } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"

type MarketplaceMetrics = {
  metrics: {
    listings: {
      total: number
      active: number
      pending_review: number
      rejected: number
      sold: number
      expired: number
    }
    sellers: {
      total: number
      active: number
      suspended: number
      verified: number
    }
    inquiries: {
      total: number
      new: number
      replied: number
      reply_rate: number | null
    }
    saved: {
      listings: number
      searches: number
    }
  }
  attention: {
    pending_listings: number
    new_inquiries: number
    unverified_sellers: number
  }
  recent_listings: MarketplaceListingSummary[]
}

type MarketplaceListingSummary = {
  id: string
  product_id: string
  title: string
  handle: string
  status:
    | "draft"
    | "pending_review"
    | "active"
    | "sold"
    | "rejected"
    | "expired"
  category: string | null
  location: string | null
  created_at: string
  seller: {
    id: string
    display_name: string
    verification_status: "unverified" | "verified"
  } | null
}

const emptyMetrics: MarketplaceMetrics = {
  metrics: {
    listings: {
      total: 0,
      active: 0,
      pending_review: 0,
      rejected: 0,
      sold: 0,
      expired: 0,
    },
    sellers: {
      total: 0,
      active: 0,
      suspended: 0,
      verified: 0,
    },
    inquiries: {
      total: 0,
      new: 0,
      replied: 0,
      reply_rate: null,
    },
    saved: {
      listings: 0,
      searches: 0,
    },
  },
  attention: {
    pending_listings: 0,
    new_inquiries: 0,
    unverified_sellers: 0,
  },
  recent_listings: [],
}

const statusColor: Record<
  MarketplaceListingSummary["status"],
  "grey" | "orange" | "green" | "red"
> = {
  draft: "grey",
  pending_review: "orange",
  active: "green",
  sold: "grey",
  rejected: "red",
  expired: "grey",
}

const statusLabel: Record<MarketplaceListingSummary["status"], string> = {
  draft: "Draft",
  pending_review: "Pending review",
  active: "Live",
  sold: "Sold",
  rejected: "Rejected",
  expired: "Expired",
}

const MarketplacePage = () => {
  const [data, setData] = useState<MarketplaceMetrics>(emptyMetrics)
  const [isLoading, setIsLoading] = useState(true)
  const storefrontBase = useMemo(() => {
    if (typeof window === "undefined") {
      return "http://localhost:8000"
    }

    return window.location.origin.replace(":9000", ":8000")
  }, [])
  const totalAttention =
    data.attention.pending_listings +
    data.attention.new_inquiries +
    data.attention.unverified_sellers
  const attentionItems = useMemo(
    () => [
      {
        label: "Pending listings",
        description: "Review seller submissions and approve or reject them.",
        value: data.attention.pending_listings,
        href: "/app/listing-moderation",
        cta: "Moderate listings",
      },
      {
        label: "New inquiries",
        description: "Check buyer messages that sellers have not triaged yet.",
        value: data.attention.new_inquiries,
        href: "/app/inquiries",
        cta: "Review inquiries",
      },
      {
        label: "Unverified sellers",
        description: "Verify legitimate sellers and inspect profile quality.",
        value: data.attention.unverified_sellers,
        href: "/app/sellers",
        cta: "Review sellers",
      },
    ],
    [data],
  )
  const flowItems = useMemo(
    () => [
      {
        eyebrow: "Seller",
        label: "Submit listing",
        description: "Seller adds product, price, farm details, and photos.",
        value: data.metrics.listings.total,
        valueLabel: "total",
        href: `${storefrontBase}/us/account/listings/new`,
        cta: "Create test listing",
      },
      {
        eyebrow: "Admin",
        label: "Approve review",
        description:
          "Pending submissions stay hidden until moderation approves.",
        value: data.metrics.listings.pending_review,
        valueLabel: "pending",
        href: "/app/listing-moderation",
        cta: "Open moderation",
      },
      {
        eyebrow: "Storefront",
        label: "Buyer can see it",
        description:
          "Approval publishes the Medusa product and exposes it in store.",
        value: data.metrics.listings.active,
        valueLabel: "live",
        href: `${storefrontBase}/us/store`,
        cta: "View marketplace",
      },
      {
        eyebrow: "Follow-up",
        label: "Inquiry or save",
        description: "Buyer actions create the next operational queues.",
        value: data.metrics.inquiries.total,
        valueLabel: "inquiries",
        href: "/app/inquiries",
        cta: "Review inquiries",
      },
    ],
    [data, storefrontBase],
  )

  const loadMetrics = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/admin/marketplace")

      if (!response.ok) {
        throw new Error("Could not load marketplace metrics")
      }

      setData((await response.json()) as MarketplaceMetrics)
    } catch (error) {
      toast.error("Unable to load marketplace dashboard", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadMetrics()
  }, [])

  return (
    <OpsPage
      title="Marketplace command center"
      subtitle="End-to-end view from seller submission to approved storefront listing."
      actions={
        <>
          <div className="flex items-center rounded-md border border-ui-border-base bg-ui-bg-subtle px-3">
            <Text className="text-ui-fg-subtle" size="small">
              {totalAttention} needs attention
            </Text>
          </div>
          <Button
            size="small"
            variant="secondary"
            onClick={() => void loadMetrics()}
            isLoading={isLoading}
          >
            Refresh
          </Button>
        </>
      }
    >
      <OpsSection>
        <div className="grid grid-cols-1 gap-3 p-6 md:grid-cols-4">
          <SignalCard
            label="Active listings"
            value={data.metrics.listings.active}
            tone="success"
          />
          <SignalCard
            label="Pending review"
            value={data.metrics.listings.pending_review}
            tone={
              data.metrics.listings.pending_review > 0 ? "attention" : "neutral"
            }
          />
          <SignalCard
            label="Verified sellers"
            value={data.metrics.sellers.verified}
            detail={`${data.metrics.sellers.total} total sellers`}
          />
          <SignalCard
            label="Reply rate"
            value={
              data.metrics.inquiries.reply_rate === null
                ? "No history"
                : `${data.metrics.inquiries.reply_rate}%`
            }
            tone={
              data.metrics.inquiries.reply_rate !== null &&
              data.metrics.inquiries.reply_rate < 50
                ? "danger"
                : "neutral"
            }
          />
        </div>
      </OpsSection>

      <OpsSection
        title="Marketplace test flow"
        subtitle="Use this path to prove a seller listing becomes a buyer-facing product."
      >
        <div className="grid grid-cols-1 gap-3 p-6 xl:grid-cols-4">
          {flowItems.map((item, index) => (
            <FlowStage
              key={item.label}
              index={index + 1}
              eyebrow={item.eyebrow}
              label={item.label}
              description={item.description}
              value={item.value}
              valueLabel={item.valueLabel}
              href={item.href}
              cta={item.cta}
            />
          ))}
        </div>
      </OpsSection>

      <OpsSection
        title="Needs attention"
        subtitle="Queues that can block the marketplace flow."
      >
        <div className="grid grid-cols-1 gap-3 p-6 md:grid-cols-3">
          {attentionItems.map((item) => (
            <a
              key={item.label}
              className="rounded-md border border-ui-border-base p-4 transition-colors hover:border-ui-border-interactive hover:bg-ui-bg-subtle"
              href={item.href}
            >
              <div className="flex items-start justify-between gap-x-3">
                <div>
                  <Text weight="plus">{item.label}</Text>
                  <Text className="mt-1 text-ui-fg-subtle" size="small">
                    {item.description}
                  </Text>
                </div>
                <Text size="xlarge" weight="plus">
                  {item.value}
                </Text>
              </div>
              <Text className="mt-4 text-ui-fg-interactive" size="small">
                {item.cta}
              </Text>
            </a>
          ))}
        </div>
      </OpsSection>

      <OpsSection
        title="Recent listing path"
        subtitle="Latest seller submissions with moderation and storefront links."
        actions={
          <>
            <Button size="small" variant="secondary" asChild>
              <a href="/app/listing-moderation">Moderation queue</a>
            </Button>
            <Button size="small" variant="secondary" asChild>
              <a href={`${storefrontBase}/us/store`}>Storefront</a>
            </Button>
          </>
        }
      >
        {data.recent_listings.length === 0 ? (
          <EmptyState
            title={
              isLoading ? "Loading marketplace listings..." : "No listings yet"
            }
            description="Recent seller submissions will appear here with links into moderation and the storefront."
          />
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Listing</Table.HeaderCell>
                <Table.HeaderCell>Seller</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Where to test</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.recent_listings.map((listing) => (
                <Table.Row key={listing.id}>
                  <Table.Cell>
                    <div className="flex max-w-[340px] flex-col gap-y-1">
                      <Text weight="plus">{listing.title}</Text>
                      <Text className="text-ui-fg-subtle" size="small">
                        {[listing.category, listing.location]
                          .filter(Boolean)
                          .join(" | ") || "No category or location"}
                      </Text>
                      <Text className="text-ui-fg-subtle" size="small">
                        Submitted {formatDate(listing.created_at)}
                      </Text>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-col gap-y-1">
                      <Text>
                        {listing.seller?.display_name ?? "Unknown seller"}
                      </Text>
                      {listing.seller && (
                        <Text className="text-ui-fg-subtle" size="small">
                          {listing.seller.verification_status === "verified"
                            ? "Verified seller"
                            : "Unverified seller"}
                        </Text>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge color={statusColor[listing.status]}>
                      {statusLabel[listing.status]}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-wrap gap-2">
                      {listing.status === "active" ? (
                        <Button size="small" variant="secondary" asChild>
                          <a
                            href={`${storefrontBase}/us/products/${listing.handle}`}
                          >
                            Product page
                          </a>
                        </Button>
                      ) : (
                        <Button size="small" variant="secondary" asChild>
                          <a href="/app/listing-moderation">Review listing</a>
                        </Button>
                      )}
                      <Button size="small" variant="transparent" asChild>
                        <a href={`/app/products/${listing.product_id}`}>
                          Admin product
                        </a>
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </OpsSection>

      <OpsSection title="Marketplace totals">
        <div className="grid grid-cols-1 gap-3 p-6 md:grid-cols-3">
          <SignalCard
            label="Total listings"
            value={data.metrics.listings.total}
          />
          <SignalCard
            label="Total sellers"
            value={data.metrics.sellers.total}
          />
          <SignalCard
            label="Total inquiries"
            value={data.metrics.inquiries.total}
          />
          <SignalCard
            label="Saved listings"
            value={data.metrics.saved.listings}
          />
          <SignalCard
            label="Saved searches"
            value={data.metrics.saved.searches}
          />
          <SignalCard
            label="Suspended sellers"
            value={data.metrics.sellers.suspended}
            tone={data.metrics.sellers.suspended > 0 ? "danger" : "neutral"}
          />
        </div>
      </OpsSection>
    </OpsPage>
  )
}

const FlowStage = ({
  index,
  eyebrow,
  label,
  description,
  value,
  valueLabel,
  href,
  cta,
}: {
  index: number
  eyebrow: string
  label: string
  description: string
  value: number
  valueLabel: string
  href: string
  cta: string
}) => (
  <a
    className="flex min-h-[184px] flex-col justify-between rounded-md border border-ui-border-base p-4 transition-colors hover:border-ui-border-interactive hover:bg-ui-bg-subtle"
    href={href}
  >
    <div>
      <div className="flex items-center justify-between gap-x-3">
        <Text className="text-ui-fg-subtle" size="small">
          {index}. {eyebrow}
        </Text>
        <div className="flex h-8 min-w-8 items-center justify-center rounded-full border border-ui-border-base px-2">
          <Text size="small" weight="plus">
            {value}
          </Text>
        </div>
      </div>
      <Text className="mt-3" weight="plus">
        {label}
      </Text>
      <Text className="mt-1 text-ui-fg-subtle" size="small">
        {description}
      </Text>
    </div>
    <div className="mt-5 flex items-center justify-between gap-x-3">
      <Text className="text-ui-fg-subtle" size="small">
        {valueLabel}
      </Text>
      <Text className="text-ui-fg-interactive" size="small">
        {cta}
      </Text>
    </div>
  </a>
)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value))

export const config = defineRouteConfig({
  label: "Marketplace",
  rank: 44,
})

export default MarketplacePage
