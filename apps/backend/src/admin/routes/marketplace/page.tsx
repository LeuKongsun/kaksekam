import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Table, Text, toast } from "@medusajs/ui"
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
}

const MarketplacePage = () => {
  const [data, setData] = useState<MarketplaceMetrics>(emptyMetrics)
  const [isLoading, setIsLoading] = useState(true)
  const attentionItems = useMemo(
    () => [
      {
        label: "Pending listings",
        value: data.attention.pending_listings,
        href: "/app/listing-moderation",
      },
      {
        label: "New inquiries",
        value: data.attention.new_inquiries,
        href: "/app/sellers",
      },
      {
        label: "Unverified sellers",
        value: data.attention.unverified_sellers,
        href: "/app/sellers",
      },
    ],
    [data]
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
    <div className="flex flex-col gap-y-6">
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading>Marketplace overview</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              Listings, sellers, inquiries, and saved marketplace activity.
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
        </div>
        <div className="grid grid-cols-1 gap-3 p-6 md:grid-cols-4">
          <MetricCard label="Active listings" value={data.metrics.listings.active} />
          <MetricCard
            label="Pending review"
            value={data.metrics.listings.pending_review}
          />
          <MetricCard label="Verified sellers" value={data.metrics.sellers.verified} />
          <MetricCard
            label="Reply rate"
            value={
              data.metrics.inquiries.reply_rate === null
                ? "No history"
                : `${data.metrics.inquiries.reply_rate}%`
            }
          />
        </div>
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Needs attention</Heading>
        </div>
        <Table>
          <Table.Body>
            {attentionItems.map((item) => (
              <Table.Row key={item.label}>
                <Table.Cell>
                  <Text weight="plus">{item.label}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text>{item.value}</Text>
                </Table.Cell>
                <Table.Cell className="text-right">
                  <a className="text-ui-fg-interactive" href={item.href}>
                    Review
                  </a>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Marketplace totals</Heading>
        </div>
        <div className="grid grid-cols-1 gap-3 p-6 md:grid-cols-3">
          <MetricCard label="Total listings" value={data.metrics.listings.total} />
          <MetricCard label="Total sellers" value={data.metrics.sellers.total} />
          <MetricCard label="Total inquiries" value={data.metrics.inquiries.total} />
          <MetricCard label="Saved listings" value={data.metrics.saved.listings} />
          <MetricCard label="Saved searches" value={data.metrics.saved.searches} />
          <MetricCard
            label="Suspended sellers"
            value={data.metrics.sellers.suspended}
          />
        </div>
      </Container>
    </div>
  )
}

const MetricCard = ({
  label,
  value,
}: {
  label: string
  value: number | string
}) => (
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
  label: "Marketplace",
  rank: 44,
})

export default MarketplacePage
