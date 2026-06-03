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
        <div className="mt-5 grid grid-cols-2 gap-3 small:grid-cols-4">
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
        <div className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
          {visibleInquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className={`grid grid-cols-1 gap-4 p-4 small:grid-cols-[88px_1fr] ${
                inquiry.status === "new" ? "bg-[#fff8f6]" : "bg-white"
              }`}
            >
              <InquiryListingThumb inquiry={inquiry} />
              <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-y-1 small:flex-row small:items-start small:justify-between">
                  <div>
                    <InquiryListingTitle inquiry={inquiry} />
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <div className="text-base-semi">{inquiry.buyer_name}</div>
                      <StatusBadge status={inquiry.status} />
                    </div>
                    <div className="text-small-regular text-ui-fg-subtle">
                      {inquiry.buyer_email}
                      {inquiry.buyer_phone ? ` | ${inquiry.buyer_phone}` : ""}
                    </div>
                  </div>
                  <div className="text-small-regular text-ui-fg-subtle">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="rounded-md border border-gray-200 bg-white p-3">
                  <div className="mb-1 text-[11px] font-medium uppercase text-ui-fg-subtle">
                    Buyer message
                  </div>
                  <p className="whitespace-pre-line text-small-regular text-ui-fg-base">
                  {inquiry.message}
                  </p>
                </div>
                {inquiry.replied_at && (
                  <p className="text-small-regular text-ui-fg-subtle">
                    Marked replied on{" "}
                    {new Date(inquiry.replied_at).toLocaleDateString()}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`mailto:${inquiry.buyer_email}?subject=${encodeURIComponent(
                      `Re: ${inquiry.product?.title ?? "Your listing inquiry"}`
                    )}`}
                    className="rounded-md bg-ui-fg-base px-3 py-1.5 text-small-semi text-white transition-colors hover:bg-ui-fg-subtle"
                  >
                    Reply by email
                  </a>
                  {inquiry.buyer_phone && (
                    <a
                      href={`tel:${inquiry.buyer_phone.replace(/[^\d+]/g, "")}`}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base"
                    >
                      Call
                    </a>
                  )}
                  {inquiry.status === "new" && (
                    <form
                      action={updateSellerInquiryStatus.bind(
                        null,
                        inquiry.id,
                        "read"
                      )}
                    >
                      <button className="rounded-md border border-gray-300 px-3 py-1.5 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base">
                        Mark read
                      </button>
                    </form>
                  )}
                  {(inquiry.status === "read" ||
                    inquiry.status === "replied") && (
                    <form
                      action={updateSellerInquiryStatus.bind(
                        null,
                        inquiry.id,
                        "new"
                      )}
                    >
                      <button className="rounded-md border border-gray-300 px-3 py-1.5 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base">
                        Mark new
                      </button>
                    </form>
                  )}
                  {inquiry.status !== "replied" && (
                    <form
                      action={updateSellerInquiryStatus.bind(
                        null,
                        inquiry.id,
                        "replied"
                      )}
                    >
                      <button className="rounded-md border border-gray-300 px-3 py-1.5 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base">
                        Mark replied
                      </button>
                    </form>
                  )}
                  <form
                    action={updateSellerInquiryStatus.bind(
                      null,
                      inquiry.id,
                      "archived"
                    )}
                  >
                    <button className="rounded-md border border-gray-300 px-3 py-1.5 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base">
                      Archive
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {archivedInquiries.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-base-semi">Archived</h2>
          <div className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
            {archivedInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="grid grid-cols-1 gap-4 p-4 small:grid-cols-[88px_1fr]"
              >
                <InquiryListingThumb inquiry={inquiry} />
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex flex-col gap-y-1 small:flex-row small:items-start small:justify-between">
                    <div>
                      <InquiryListingTitle inquiry={inquiry} />
                      <div className="mt-2 text-base-semi">
                        {inquiry.buyer_name}
                      </div>
                      <div className="text-small-regular text-ui-fg-subtle">
                        {inquiry.buyer_email}
                        {inquiry.buyer_phone ? ` | ${inquiry.buyer_phone}` : ""}
                      </div>
                    </div>
                    <div className="text-small-regular text-ui-fg-subtle">
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="line-clamp-2 whitespace-pre-line text-small-regular text-ui-fg-subtle">
                    {inquiry.message}
                  </p>
                  {inquiry.replied_at && (
                    <p className="text-small-regular text-ui-fg-subtle">
                      Marked replied on{" "}
                      {new Date(inquiry.replied_at).toLocaleDateString()}
                    </p>
                  )}
                  <form
                    action={updateSellerInquiryStatus.bind(
                      null,
                      inquiry.id,
                      "read"
                    )}
                  >
                    <button className="rounded-md border border-gray-300 px-3 py-1.5 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base">
                      Restore
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const InquirySignal = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-md border border-gray-200 bg-white p-4">
    <div className="text-[11px] font-medium uppercase text-ui-fg-subtle">
      {label}
    </div>
    <div className="mt-1 text-xl-semi text-ui-fg-base">{value}</div>
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
