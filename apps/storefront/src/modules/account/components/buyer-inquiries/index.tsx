import { BuyerInquiry } from "@lib/data/listing-inquiries"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Eye from "@modules/common/icons/eye"
import Package from "@modules/common/icons/package"

type BuyerInquiriesProps = {
  inquiries: BuyerInquiry[]
}

const statusLabels: Record<BuyerInquiry["status"], string> = {
  new: "Sent",
  read: "Read",
  replied: "Replied",
  archived: "Archived",
}

const BuyerInquiries = ({ inquiries }: BuyerInquiriesProps) => {
  const openCount = inquiries.filter(
    (inquiry) => inquiry.status !== "archived"
  ).length
  const repliedCount = inquiries.filter(
    (inquiry) => inquiry.status === "replied"
  ).length

  return (
    <div className="w-full" data-testid="buyer-inquiries-page-wrapper">
      <div className="rounded-md border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-200 p-4">
          <h1 className="text-large-semi text-ui-fg-base">Sent messages</h1>
          <p className="text-small-regular text-ui-fg-subtle">
            {inquiries.length} sent, {openCount} open, {repliedCount} replied.
          </p>
        </div>

        <div className="w-full max-w-full overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr className="text-[11px] font-medium uppercase text-ui-fg-subtle">
                  <th className="w-[34%] px-4 py-3">Listing</th>
                  <th className="w-[20%] px-4 py-3">Seller</th>
                  <th className="w-[24%] px-4 py-3">Message</th>
                  <th className="w-[12%] px-4 py-3">Status</th>
                  <th className="w-[10%] px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inquiries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16">
                      <EmptyState label="No sent messages yet." />
                    </td>
                  </tr>
                ) : (
                  inquiries.map((inquiry) => (
                    <BuyerInquiryRow key={inquiry.id} inquiry={inquiry} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

const BuyerInquiryRow = ({ inquiry }: { inquiry: BuyerInquiry }) => (
  <tr className="bg-white hover:bg-gray-50/70">
    <td className="px-4 py-3 align-middle">
      <div className="flex min-w-0 gap-3">
        <ListingThumb
          thumbnail={inquiry.product?.thumbnail}
          title={inquiry.product?.title}
        />
        <div className="min-w-0">
          {inquiry.product ? (
            <LocalizedClientLink
              href={`/products/${inquiry.product.handle}`}
              className="block truncate text-base-semi text-ui-fg-base hover:text-ui-fg-interactive"
            >
              {inquiry.product.title}
            </LocalizedClientLink>
          ) : (
            <div className="truncate text-base-semi">Listing unavailable</div>
          )}
          <div className="truncate text-small-regular text-ui-fg-subtle">
            {formatDate(inquiry.created_at)}
          </div>
        </div>
      </div>
    </td>
    <td className="truncate px-4 py-3 align-middle text-base-regular text-ui-fg-base">
      {inquiry.product?.seller ? (
        <LocalizedClientLink
          href={`/sellers/${inquiry.product.seller.handle}`}
          className="hover:text-ui-fg-interactive"
        >
          {inquiry.product.seller.display_name}
        </LocalizedClientLink>
      ) : (
        "Seller unavailable"
      )}
    </td>
    <td className="px-4 py-3 align-middle">
      <p className="truncate text-small-regular text-ui-fg-base">
        {inquiry.message}
      </p>
    </td>
    <td className="px-4 py-3 align-middle">
      <StatusBadge status={inquiry.status} />
    </td>
    <td className="px-4 py-3 align-middle text-right">
      {inquiry.product?.seller && (
        <LocalizedClientLink
          href={`/sellers/${inquiry.product.seller.handle}`}
          className={iconActionClass}
          title="View seller"
          aria-label="View seller"
        >
          <Eye size={16} />
        </LocalizedClientLink>
      )}
    </td>
  </tr>
)

const ListingThumb = ({
  thumbnail,
  title,
}: {
  thumbnail?: string | null
  title?: string | null
}) => (
  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-gray-100">
    {thumbnail ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={thumbnail}
        alt={title ?? "Listing"}
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center text-ui-fg-muted">
        <Package size={18} />
      </div>
    )}
  </div>
)

const EmptyState = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center text-center text-ui-fg-muted">
    <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-gray-300 bg-ui-bg-subtle">
      <Package size={28} />
    </div>
    <p className="mt-3 text-small-semi text-ui-fg-base">No data</p>
    <p className="mt-1 text-small-regular text-ui-fg-subtle">{label}</p>
  </div>
)

const StatusBadge = ({ status }: { status: BuyerInquiry["status"] }) => (
  <span
    className={`inline-flex rounded-md border px-2.5 py-1 text-small-semi ${
      status === "replied"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : "border-gray-200 bg-gray-50 text-ui-fg-subtle"
    }`}
  >
    {statusLabels[status]}
  </span>
)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))

const iconActionClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-ui-fg-base transition-colors hover:bg-gray-50 hover:text-ui-fg-interactive"

export default BuyerInquiries
