import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, StatusBadge, Table, Text, toast } from "@medusajs/ui"
import { SVGProps, useEffect, useMemo, useState } from "react"
import { EmptyState, OpsSection } from "../../components/marketplace-ops"

type ListingReport = {
  id: string
  listing_id: string
  reason: string
  details: string | null
  reporter_contact: string | null
  status: "new" | "resolved" | "dismissed"
  created_at: string
  listing: {
    title: string
    handle: string
    listing_status: string
    seller_name: string
  } | null
}

const ReportsPage = () => {
  const [reports, setReports] = useState<ListingReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ListingReport["status"] | "all">("new")

  const loadReports = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/admin/listing-reports")
      if (!response.ok) throw new Error("Could not load reports")
      const data = (await response.json()) as { reports: ListingReport[] }
      setReports(data.reports)
    } catch (error) {
      toast.error("Unable to load reports", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadReports()
  }, [])

  const filteredReports = useMemo(
    () =>
      reports.filter(
        (report) => statusFilter === "all" || report.status === statusFilter
      ),
    [reports, statusFilter]
  )

  const reviewReport = async (
    report: ListingReport,
    status: "resolved" | "dismissed"
  ) => {
    setUpdatingId(report.id)
    try {
      const response = await fetch(`/admin/listing-reports/${report.id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Could not update report")
      toast.success(status === "resolved" ? "Report resolved" : "Report dismissed")
      await loadReports()
    } catch (error) {
      toast.error("Unable to update report", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <OpsSection
      title="Listing reports"
      subtitle={`${reports.filter((report) => report.status === "new").length} reports need review.`}
      actions={
        <select
          aria-label="Filter reports by status"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as ListingReport["status"] | "all")
          }
          className="txt-compact-small h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2.5"
        >
          <option value="new">New</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
          <option value="all">All</option>
        </select>
      }
    >
      {filteredReports.length === 0 ? (
        <EmptyState
          title={isLoading ? "Loading reports..." : "No reports"}
          description="Buyer safety reports will appear here."
        />
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Listing</Table.HeaderCell>
              <Table.HeaderCell>Reason</Table.HeaderCell>
              <Table.HeaderCell>Details</Table.HeaderCell>
              <Table.HeaderCell>Reported</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredReports.map((report) => (
              <Table.Row key={report.id}>
                <Table.Cell>
                  <div>
                    <Text size="small" weight="plus">
                      {report.listing?.title ?? report.listing_id}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {report.listing?.seller_name ?? "Unknown seller"}
                    </Text>
                  </div>
                </Table.Cell>
                <Table.Cell className="capitalize">{report.reason}</Table.Cell>
                <Table.Cell className="max-w-[280px]">
                  <span className="line-clamp-2">
                    {report.details || report.reporter_contact || "No details"}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
                    new Date(report.created_at)
                  )}
                </Table.Cell>
                <Table.Cell>
                  <StatusBadge
                    color={
                      report.status === "new"
                        ? "orange"
                        : report.status === "resolved"
                          ? "green"
                          : "grey"
                    }
                  >
                    {report.status}
                  </StatusBadge>
                </Table.Cell>
                <Table.Cell className="text-right">
                  {report.status === "new" && (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="small"
                        variant="secondary"
                        disabled={updatingId === report.id}
                        onClick={() => void reviewReport(report, "dismissed")}
                      >
                        Dismiss
                      </Button>
                      <Button
                        size="small"
                        isLoading={updatingId === report.id}
                        onClick={() => void reviewReport(report, "resolved")}
                      >
                        Resolve
                      </Button>
                    </div>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </OpsSection>
  )
}

const ReportsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
    <path d="M10 3 17 16H3L10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M10 7.5v4M10 14h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export const config = defineRouteConfig({
  label: "Reports",
  icon: ReportsIcon,
  rank: 45,
})

export default ReportsPage
