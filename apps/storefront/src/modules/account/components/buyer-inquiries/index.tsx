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
  return (
    <div className="w-full" data-testid="buyer-inquiries-page-wrapper">
      <div className="mb-8 rounded-md border border-gray-200 bg-white p-5">
        <h1 className="text-2xl-semi">Buyer inquiries</h1>
        <p className="mt-2 max-w-2xl text-base-regular text-ui-fg-subtle">
          Track messages you have sent to farmers while signed in.
        </p>
      </div>

      {inquiries.length === 0 ? (
        <div className="rounded-md border border-gray-200 p-4 text-base-regular text-ui-fg-subtle">
          No buyer inquiries yet.
        </div>
      ) : (
        <div className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="grid grid-cols-1 gap-3 p-4 small:grid-cols-[72px_1fr_auto]"
            >
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
              <div>
                {inquiry.product ? (
                  <LocalizedClientLink
                    href={`/products/${inquiry.product.handle}`}
                    className="text-base-semi text-ui-fg-base hover:text-ui-fg-interactive"
                  >
                    {inquiry.product.title}
                  </LocalizedClientLink>
                ) : (
                  <div className="text-base-semi">Listing unavailable</div>
                )}
                {inquiry.product?.seller && (
                  <div className="mt-1 text-small-regular text-ui-fg-subtle">
                    Sent to{" "}
                    <LocalizedClientLink
                      href={`/sellers/${inquiry.product.seller.handle}`}
                      className="hover:text-ui-fg-base"
                    >
                      {inquiry.product.seller.display_name}
                    </LocalizedClientLink>
                  </div>
                )}
                <p className="mt-3 whitespace-pre-line text-small-regular text-ui-fg-base">
                  {inquiry.message}
                </p>
                {inquiry.replied_at && (
                  <p className="mt-2 text-small-regular text-ui-fg-subtle">
                    Marked replied on{" "}
                    {new Date(inquiry.replied_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="small:text-right">
                <span className="inline-flex rounded-md border border-gray-200 px-2 py-1 text-small-regular">
                  {statusLabels[inquiry.status]}
                </span>
                <div className="mt-2 text-small-regular text-ui-fg-subtle">
                  {new Date(inquiry.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BuyerInquiries
