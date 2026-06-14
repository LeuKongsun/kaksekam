import {
  SellerInquiry,
  updateSellerInquiryStatus,
} from "@lib/data/listing-inquiries"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type SellerInquiriesProps = {
  inquiries: SellerInquiry[]
}

const SellerInquiries = ({ inquiries }: SellerInquiriesProps) => {
  const visibleInquiries = inquiries.filter(
    (inquiry) => inquiry.status !== "archived"
  )
  const archivedInquiries = inquiries.filter(
    (inquiry) => inquiry.status === "archived"
  )
  const newCount = inquiries.filter((inquiry) => inquiry.status === "new").length
  const repliedCount = inquiries.filter(
    (inquiry) => inquiry.status === "replied"
  ).length
  const activeCount = visibleInquiries.length
  const archivedCount = archivedInquiries.length

  return (
    <div className="w-full" data-testid="seller-inquiries-page-wrapper">
      <div className="mb-8">
        <div>
          <h1 className="text-2xl-semi">Seller inquiries</h1>
          <p className="mt-2 max-w-2xl text-base-regular text-ui-fg-subtle">
            Triage buyer messages, reply directly, and keep each listing
            conversation moving.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-y border-gray-200 py-3">
          <InquirySignal label="New" value={newCount} />
          <InquirySignal label="Open" value={activeCount} />
          <InquirySignal label="Replied" value={repliedCount} />
          <InquirySignal label="Archived" value={archivedCount} />
        </div>
      </div>

      {visibleInquiries.length === 0 ? (
        <div className="rounded-md border border-gray-200 p-4 text-base-regular text-ui-fg-subtle">
          No inquiries yet.
        </div>
      ) : (
        <SellerInquiryTable inquiries={visibleInquiries} />
      )}

      {archivedInquiries.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-base-semi">Archived</h2>
          <SellerInquiryTable inquiries={archivedInquiries} archived />
        </div>
      )}
    </div>
  )
}

const InquirySignal = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-baseline gap-x-2">
    <span className="text-[11px] font-medium uppercase text-ui-fg-subtle">
      {label}
    </span>
    <span className="text-base-semi text-ui-fg-base">{value}</span>
  </div>
)

const SellerInquiryTable = ({
  inquiries,
  archived = false,
}: {
  inquiries: SellerInquiry[]
  archived?: boolean
}) => (
  <div className="w-full max-w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-left">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr className="text-[11px] font-medium uppercase text-ui-fg-subtle">
            <th className="w-[28%] px-3 py-4">Listing</th>
            <th className="w-[20%] px-3 py-4">Buyer</th>
            <th className="w-[27%] px-3 py-4">Message</th>
            <th className="w-[11%] px-3 py-4">Status</th>
            <th className="w-[14%] px-3 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {inquiries.map((inquiry) => (
            <SellerInquiryRow
              key={inquiry.id}
              inquiry={inquiry}
              archived={archived}
            />
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const SellerInquiryRow = ({
  inquiry,
  archived,
}: {
  inquiry: SellerInquiry
  archived: boolean
}) => (
  <tr className={inquiry.status === "new" ? "bg-[#fff8f6]" : "bg-white"}>
    <td className="px-3 py-4 align-middle">
      <div className="flex min-w-0 gap-3">
        <div className="h-12 w-12 shrink-0">
          <InquiryListingThumb inquiry={inquiry} />
        </div>
        <InquiryListingTitle inquiry={inquiry} />
      </div>
    </td>
    <td className="px-3 py-4 align-middle">
      <div className="text-base-semi text-ui-fg-base">{inquiry.buyer_name}</div>
      <div className="break-words text-small-regular text-ui-fg-subtle">
        {inquiry.buyer_email}
      </div>
      {inquiry.buyer_phone && (
        <div className="text-small-regular text-ui-fg-subtle">
          {inquiry.buyer_phone}
        </div>
      )}
    </td>
    <td className="px-3 py-4 align-middle">
      <p className="line-clamp-2 whitespace-pre-line text-small-regular text-ui-fg-base">
        {inquiry.message}
      </p>
      <div className="mt-1 text-small-regular text-ui-fg-subtle">
        {new Date(inquiry.created_at).toLocaleDateString()}
      </div>
    </td>
    <td className="px-3 py-4 align-middle">
      <StatusBadge status={inquiry.status} />
    </td>
    <td className="px-3 py-4 align-middle">
      <SellerInquiryActions inquiry={inquiry} archived={archived} />
    </td>
  </tr>
)

const SellerInquiryActions = ({
  inquiry,
  archived,
}: {
  inquiry: SellerInquiry
  archived: boolean
}) => (
  <div className="flex flex-wrap justify-end gap-2">
    <a
      href={`mailto:${inquiry.buyer_email}?subject=${encodeURIComponent(
        `Re: ${inquiry.product?.title ?? "Your listing inquiry"}`
      )}`}
      className="rounded-md bg-ui-fg-base px-3 py-1.5 text-small-semi text-white transition-colors hover:bg-ui-fg-subtle"
    >
      Reply
    </a>
    {inquiry.buyer_phone && (
      <a
        href={`tel:${inquiry.buyer_phone.replace(/[^\d+]/g, "")}`}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base"
      >
        Call
      </a>
    )}
    {archived ? (
      <form action={updateSellerInquiryStatus.bind(null, inquiry.id, "read")}>
        <button className="rounded-md border border-gray-300 px-3 py-1.5 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base">
          Restore
        </button>
      </form>
    ) : (
      <>
        {inquiry.status === "new" ? (
          <form action={updateSellerInquiryStatus.bind(null, inquiry.id, "read")}>
            <button className="rounded-md border border-gray-300 px-3 py-1.5 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base">
              Read
            </button>
          </form>
        ) : (
          <form action={updateSellerInquiryStatus.bind(null, inquiry.id, "new")}>
            <button className="rounded-md border border-gray-300 px-3 py-1.5 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base">
              New
            </button>
          </form>
        )}
        {inquiry.status !== "replied" && (
          <form
            action={updateSellerInquiryStatus.bind(null, inquiry.id, "replied")}
          >
            <button className="rounded-md border border-gray-300 px-3 py-1.5 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base">
              Replied
            </button>
          </form>
        )}
        <form
          action={updateSellerInquiryStatus.bind(null, inquiry.id, "archived")}
        >
          <button className="rounded-md border border-gray-300 px-3 py-1.5 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base">
            Archive
          </button>
        </form>
      </>
    )}
  </div>
)

const statusLabels: Record<SellerInquiry["status"], string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
  archived: "Archived",
}

const StatusBadge = ({ status }: { status: SellerInquiry["status"] }) => (
  <span
    className={`rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase ${
      status === "new"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-gray-200 bg-white text-ui-fg-subtle"
    }`}
  >
    {statusLabels[status]}
  </span>
)

const InquiryListingThumb = ({ inquiry }: { inquiry: SellerInquiry }) => (
  <div className="aspect-square overflow-hidden rounded-md bg-gray-100">
    {inquiry.product?.thumbnail && (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={inquiry.product.thumbnail}
        alt={inquiry.product.title}
        className="h-full w-full object-cover"
      />
    )}
  </div>
)

const InquiryListingTitle = ({ inquiry }: { inquiry: SellerInquiry }) =>
  inquiry.product ? (
    <div>
      <LocalizedClientLink
        href={`/products/${inquiry.product.handle}`}
        className="text-small-semi text-ui-fg-base hover:text-ui-fg-interactive"
      >
        {inquiry.product.title}
      </LocalizedClientLink>
      {inquiry.product.listing?.status && (
        <div className="mt-1 text-small-regular text-ui-fg-subtle">
          Listing status: {inquiry.product.listing.status.replace("_", " ")}
        </div>
      )}
    </div>
  ) : (
    <div className="text-small-semi text-ui-fg-subtle">Listing unavailable</div>
  )

export default SellerInquiries
