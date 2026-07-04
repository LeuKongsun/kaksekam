import { SellerProfile } from "@lib/data/sellers"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { richTextToPlainText } from "@lib/util/rich-text"
import Package from "@modules/common/icons/package"

type SellerProfileTemplateProps = {
  profile: SellerProfile
}

const formatPrice = (listing: SellerProfile["listings"][number]) => {
  if (listing.price?.calculated_amount == null) {
    return "Price unavailable"
  }

  return `${listing.price.calculated_amount} ${(
    listing.price.currency_code ?? ""
  ).toUpperCase()}`
}

const SellerProfileTemplate = ({ profile }: SellerProfileTemplateProps) => {
  const { seller, listings } = profile
  const profileImage = seller.avatar_url ?? listings[0]?.thumbnail
  const joinedDate = seller.created_at
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        year: "numeric",
      }).format(new Date(seller.created_at))
    : "Recently"

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 small:px-6 min-[1168px]:px-0">
      <section className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
        <div className="h-28 bg-[#f3f6ee]" />
        <div className="px-5 pb-5">
          <div className="-mt-10 flex flex-col gap-4 small:flex-row small:items-end small:justify-between">
            <div className="flex min-w-0 items-end gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white bg-ui-fg-base text-2xl-semi text-white shadow-sm">
                {profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profileImage}
                    alt={seller.display_name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  seller.display_name.slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-2xl-semi text-ui-fg-base">
                    {seller.display_name}
                  </h1>
                  {seller.verification_status === "verified" && (
                    <span className="inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-small-semi text-emerald-800">
                      Verified
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-small-regular text-ui-fg-subtle">
                  {seller.location && <span>{seller.location}</span>}
                  <span>Joined {joinedDate}</span>
                  <span>
                    {listings.length} listing{listings.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {(seller.phone || seller.email) && (
            <div className="mt-5 flex flex-col gap-2 text-small-regular text-ui-fg-base">
              {seller.phone && (
                <a
                  href={`tel:${seller.phone.replace(/[^\d+]/g, "")}`}
                  className="inline-flex items-center gap-2 hover:text-ui-fg-interactive"
                >
                  <PhoneIcon />
                  {seller.phone}
                </a>
              )}
              {seller.email && (
                <a
                  href={`mailto:${seller.email}`}
                  className="inline-flex items-center gap-2 break-all hover:text-ui-fg-interactive"
                >
                  <EmailIcon />
                  {seller.email}
                </a>
              )}
            </div>
          )}

          <div className="mt-5 max-w-3xl">
            <p className="whitespace-pre-line text-base-regular text-ui-fg-subtle">
              {seller.bio ||
                "This seller has not added a public bio yet. Check their listings below for available products and contact details."}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-1">
          <h2 className="text-large-semi text-ui-fg-base">Active listings</h2>
          <p className="text-small-regular text-ui-fg-subtle">
            Products currently published by {seller.display_name}.
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-md border border-gray-200 bg-white px-4 py-16 shadow-sm">
            <EmptyState />
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 small:grid-cols-2 medium:grid-cols-3">
            {listings.map((listing) => (
              <li key={listing.id}>
                <ListingCard listing={listing} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

const ListingCard = ({
  listing,
}: {
  listing: SellerProfile["listings"][number]
}) => {
  const plainDescription = richTextToPlainText(listing.description)

  return (
    <LocalizedClientLink
      href={`/products/${listing.handle}`}
      className="group block h-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition-colors hover:border-ui-fg-base"
    >
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        {listing.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.thumbnail}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ui-fg-muted">
            <Package size={28} />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate text-base-semi text-ui-fg-base">
            {listing.title}
          </h3>
          <div className="shrink-0 text-small-semi text-ui-fg-base">
            {formatPrice(listing)}
          </div>
        </div>
        <p className="mt-1 line-clamp-2 min-h-[40px] text-small-regular text-ui-fg-subtle">
          {plainDescription || "No description added."}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {listing.category && (
            <span className="rounded-md bg-gray-100 px-2 py-1 text-small-regular text-ui-fg-subtle">
              {listing.category}
            </span>
          )}
          {listing.location && (
            <span className="rounded-md bg-gray-100 px-2 py-1 text-small-regular text-ui-fg-subtle">
              {listing.location}
            </span>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}

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

const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M3 4.75C3 4.06 3.56 3.5 4.25 3.5h7.5c.69 0 1.25.56 1.25 1.25v6.5c0 .69-.56 1.25-1.25 1.25h-7.5C3.56 12.5 3 11.94 3 11.25v-6.5Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="m3.4 5 4.6 3.5L12.6 5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
)

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center text-center text-ui-fg-muted">
    <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-gray-300 bg-ui-bg-subtle">
      <Package size={28} />
    </div>
    <p className="mt-3 text-small-semi text-ui-fg-base">No active listings</p>
    <p className="mt-1 text-small-regular text-ui-fg-subtle">
      This seller has no published listings right now.
    </p>
  </div>
)

export default SellerProfileTemplate
