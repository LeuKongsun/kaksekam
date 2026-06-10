import { BuyerInquiry } from "@lib/data/listing-inquiries"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

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
  const repliedCount = inquiries.filter(
    (inquiry) => inquiry.status === "replied"
  ).length
  const openCount = inquiries.filter(
    (inquiry) => inquiry.status !== "archived"
  ).length

  return (
    <div className="w-full" data-testid="buyer-inquiries-page-wrapper">
      <div className="mb-8">
        <h1 className="text-2xl-semi">Buyer inquiries</h1>
        <p className="mt-2 max-w-2xl text-base-regular text-ui-fg-subtle">
          Track messages you have sent to sellers and revisit the listings you
          asked about.
        </p>
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-y border-gray-200 py-3">
          <BuyerSignal label="Sent" value={inquiries.length} />
          <BuyerSignal label="Open" value={openCount} />
          <BuyerSignal label="Replied" value={repliedCount} />
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="rounded-md border border-gray-200 p-4 text-base-regular text-ui-fg-subtle">
          No buyer inquiries yet.
        </div>
      ) : (
        <BuyerInquiryTable inquiries={inquiries} />
      )}
    </div>
  )
}

const BuyerSignal = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-baseline gap-x-2">
    <span className="text-[11px] font-medium uppercase text-ui-fg-subtle">
      {label}
    </span>
    <span className="text-base-semi text-ui-fg-base">{value}</span>
  </div>
)

const BuyerInquiryTable = ({ inquiries }: { inquiries: BuyerInquiry[] }) => (
  <div className="w-full max-w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-left">
        <thead className="bg-ui-fg-base">
          <tr className="text-[11px] font-medium uppercase text-white">
            <th className="w-[31%] px-3 py-4">Listing</th>
            <th className="w-[22%] px-3 py-4">Seller</th>
            <th className="w-[28%] px-3 py-4">Message</th>
            <th className="w-[10%] px-3 py-4">Status</th>
            <th className="w-[9%] px-3 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {inquiries.map((inquiry) => (
            <BuyerInquiryRow key={inquiry.id} inquiry={inquiry} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const BuyerInquiryRow = ({ inquiry }: { inquiry: BuyerInquiry }) => (
  <tr className="bg-white hover:bg-gray-50/70">
    <td className="px-3 py-4 align-middle">
      <div className="flex min-w-0 gap-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
          {inquiry.product?.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={inquiry.product.thumbnail}
              alt={inquiry.product.title}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0">
          {inquiry.product ? (
            <LocalizedClientLink
              href={`/products/${inquiry.product.handle}`}
              className="block truncate text-base-semi text-ui-fg-base hover:text-ui-fg-interactive"
            >
              {inquiry.product.title}
            </LocalizedClientLink>
          ) : (
            <div className="text-base-semi">Listing unavailable</div>
          )}
        </div>
      </div>
    </td>
    <td className="px-3 py-4 align-middle">
      {inquiry.product?.seller ? (
        <LocalizedClientLink
          href={`/sellers/${inquiry.product.seller.handle}`}
          className="text-base-semi text-ui-fg-base hover:text-ui-fg-interactive"
        >
          {inquiry.product.seller.display_name}
        </LocalizedClientLink>
      ) : (
        <span className="text-small-regular text-ui-fg-subtle">
          Seller unavailable
        </span>
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
      <span className="inline-flex rounded-md border border-gray-200 px-2 py-1 text-small-regular">
        {statusLabels[inquiry.status]}
      </span>
    </td>
    <td className="px-3 py-4 align-middle text-right">
      {inquiry.product?.seller && (
        <LocalizedClientLink
          href={`/sellers/${inquiry.product.seller.handle}`}
          className="text-small-semi text-ui-fg-base hover:text-ui-fg-interactive"
        >
          Profile
        </LocalizedClientLink>
      )}
    </td>
  </tr>
)

export default BuyerInquiries
