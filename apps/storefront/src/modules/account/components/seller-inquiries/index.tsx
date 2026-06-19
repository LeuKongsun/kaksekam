import {
  SellerInquiry,
  updateSellerInquiryStatus,
} from "@lib/data/listing-inquiries"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Eye from "@modules/common/icons/eye"
import Package from "@modules/common/icons/package"

type SellerInquiriesProps = {
  inquiries: SellerInquiry[]
}

const statusLabels: Record<SellerInquiry["status"], string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
  archived: "Archived",
}

const SellerInquiries = ({ inquiries }: SellerInquiriesProps) => {
  const openCount = inquiries.filter(
    (inquiry) => inquiry.status !== "archived"
  ).length
  const newCount = inquiries.filter((inquiry) => inquiry.status === "new").length
  const repliedCount = inquiries.filter(
    (inquiry) => inquiry.status === "replied"
  ).length

  return (
    <div className="w-full" data-testid="seller-inquiries-page-wrapper">
      <div className="rounded-md border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-200 p-4">
          <h1 className="text-large-semi text-ui-fg-base">Messages</h1>
          <p className="text-small-regular text-ui-fg-subtle">
            {inquiries.length} total, {openCount} open, {newCount} new,{" "}
            {repliedCount} replied.
          </p>
        </div>

        <div className="w-full max-w-full overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr className="text-[11px] font-medium uppercase text-ui-fg-subtle">
                  <th className="w-[30%] px-4 py-3">Listing</th>
                  <th className="w-[20%] px-4 py-3">Buyer</th>
                  <th className="w-[22%] px-4 py-3">Message</th>
                  <th className="w-[12%] px-4 py-3">Status</th>
                  <th className="w-[16%] px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inquiries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16">
                      <EmptyState label="No buyer messages yet." />
                    </td>
                  </tr>
                ) : (
                  inquiries.map((inquiry) => (
                    <SellerInquiryRow key={inquiry.id} inquiry={inquiry} />
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

const SellerInquiryRow = ({ inquiry }: { inquiry: SellerInquiry }) => (
  <tr className={inquiry.status === "new" ? "bg-[#fff8f6]" : "bg-white"}>
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
    <td className="px-4 py-3 align-middle">
      <div className="truncate text-base-semi text-ui-fg-base">
        {inquiry.buyer_name}
      </div>
      <div className="truncate text-small-regular text-ui-fg-subtle">
        {inquiry.buyer_email}
      </div>
    </td>
    <td className="px-4 py-3 align-middle">
      <p className="truncate text-small-regular text-ui-fg-base">
        {inquiry.message}
      </p>
    </td>
    <td className="px-4 py-3 align-middle">
      <StatusBadge status={inquiry.status} />
    </td>
    <td className="px-4 py-3 align-middle">
      <SellerInquiryActions inquiry={inquiry} />
    </td>
  </tr>
)

const SellerInquiryActions = ({ inquiry }: { inquiry: SellerInquiry }) => (
  <div className="flex items-center justify-end gap-2">
    <a
      href={`mailto:${inquiry.buyer_email}?subject=${encodeURIComponent(
        `Re: ${inquiry.product?.title ?? "Your listing inquiry"}`
      )}`}
      className={iconActionClass}
      title="Reply"
      aria-label="Reply"
    >
      <ReplyIcon />
    </a>
    {inquiry.buyer_phone && (
      <a
        href={`tel:${inquiry.buyer_phone.replace(/[^\d+]/g, "")}`}
        className={iconActionClass}
        title="Call"
        aria-label="Call"
      >
        <PhoneIcon />
      </a>
    )}
    <form
      action={updateSellerInquiryStatus.bind(
        null,
        inquiry.id,
        inquiry.status === "archived" ? "read" : "archived"
      )}
    >
      <button
        className={iconActionClass}
        title={inquiry.status === "archived" ? "Restore" : "Archive"}
        aria-label={inquiry.status === "archived" ? "Restore" : "Archive"}
      >
        <Eye size={16} />
      </button>
    </form>
  </div>
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

const StatusBadge = ({ status }: { status: SellerInquiry["status"] }) => (
  <span
    className={`inline-flex rounded-md border px-2.5 py-1 text-small-semi ${
      status === "new"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : status === "replied"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-gray-200 bg-gray-50 text-ui-fg-subtle"
    }`}
  >
    {statusLabels[status]}
  </span>
)

const ReplyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M3.5 4.5h9v6h-5L4 13v-2.5h-.5v-6Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
)

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M5.1 3.2 6.3 5.8 5.2 7c.7 1.5 1.8 2.6 3.3 3.3l1.2-1.1 2.6 1.2-.4 2.2c-.1.4-.4.7-.8.7-4.6-.1-8.3-3.8-8.4-8.4 0-.4.3-.7.7-.8l1.7-.9Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))

const iconActionClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-ui-fg-base transition-colors hover:bg-gray-50 hover:text-ui-fg-interactive"

export default SellerInquiries
