import { SellerProfile } from "@lib/data/sellers"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type SellerProfileTemplateProps = {
  profile: SellerProfile
}

const formatPrice = (price: SellerProfile["listings"][number]["price"]) => {
  if (!price?.calculated_amount) {
    return "Price unavailable"
  }

  return `${price.calculated_amount} ${(
    price.currency_code ?? ""
  ).toUpperCase()}`
}

const formatListingDetails = (listing: SellerProfile["listings"][number]) =>
  [
    listing.category,
    listing.location,
    listing.quantity && listing.unit
      ? `${listing.quantity} ${listing.unit}`
      : listing.quantity,
    listing.availability,
    listing.condition,
    listing.variety,
    listing.production_method,
    listing.harvest_date,
    listing.breed,
    listing.age,
    listing.sex,
    listing.health_notes,
    listing.brand,
    listing.equipment_model,
    listing.year,
    listing.pack_size,
    listing.expiry_date,
    listing.service_area,
  ].filter(Boolean)

const SellerProfileTemplate = ({ profile }: SellerProfileTemplateProps) => {
  const { seller, listings } = profile
  const stats = seller.trust_stats
  const joinedDate = seller.created_at
    ? new Date(seller.created_at).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : null

  return (
    <div className="content-container py-10">
      <div className="mb-10 grid grid-cols-1 gap-6 border-b border-gray-200 pb-8 medium:grid-cols-[1fr_280px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl-semi">{seller.display_name}</h1>
            {seller.verification_status === "verified" && (
              <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-medium uppercase text-green-700">
                Verified
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-col gap-y-1 text-base-regular text-ui-fg-subtle">
            {seller.location && <span>{seller.location}</span>}
            {(seller.email || seller.phone) && (
              <span>{seller.email ?? seller.phone}</span>
            )}
          </div>
          {seller.bio && (
            <p className="mt-4 max-w-2xl whitespace-pre-line text-base-regular text-ui-fg-subtle">
              {seller.bio}
            </p>
          )}
          <div className="mt-5 grid grid-cols-2 gap-3 text-small-regular small:max-w-2xl small:grid-cols-4">
            <TrustStat
              label="Profile"
              value={
                stats ? `${stats.profile_completeness}% complete` : "Not scored"
              }
            />
            <TrustStat
              label="Replies"
              value={
                stats?.reply_rate === null || stats?.reply_rate === undefined
                  ? "No history yet"
                  : `${stats.reply_rate}% rate`
              }
            />
            <TrustStat
              label="Inquiries"
              value={`${stats?.inquiry_count ?? 0} received`}
            />
            <TrustStat label="Joined" value={joinedDate ?? "Recently"} />
          </div>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <div className="text-[11px] font-medium uppercase text-ui-fg-subtle">
            Marketplace presence
          </div>
          <div className="mt-2 text-xl-semi text-ui-fg-base">
            {listings.length} active listing{listings.length === 1 ? "" : "s"}
          </div>
          <p className="mt-2 text-small-regular text-ui-fg-subtle">
            Buyers contact this seller directly from individual listings.
          </p>
          {seller.email && (
            <a
              href={`mailto:${seller.email}`}
              className="mt-4 inline-flex text-small-semi text-ui-fg-base hover:text-ui-fg-interactive"
            >
              Email seller
            </a>
          )}
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-md border border-gray-200 p-4 text-base-regular text-ui-fg-subtle">
          This farmer has no active listings.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-5 small:grid-cols-2 medium:grid-cols-3">
          {listings.map((listing) => (
            <li key={listing.id}>
              <LocalizedClientLink
                href={`/products/${listing.handle}`}
                className="group block rounded-md border border-gray-200 bg-white p-3 transition-colors hover:border-ui-fg-base"
              >
                <div className="aspect-square overflow-hidden rounded-md bg-gray-100">
                  {listing.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.thumbnail}
                      alt={listing.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="mt-4 flex items-start justify-between gap-x-4">
                  <div>
                    <div className="text-base-semi">{listing.title}</div>
                    <div className="mt-1 text-small-regular text-ui-fg-subtle">
                      {formatPrice(listing.price)} asking
                    </div>
                  </div>
                </div>
                {formatListingDetails(listing).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formatListingDetails(listing).map((detail) => (
                      <span
                        key={detail}
                        className="rounded-md bg-gray-100 px-2 py-1 text-small-regular text-ui-fg-subtle"
                      >
                        {detail}
                      </span>
                    ))}
                  </div>
                )}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const TrustStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-gray-200 bg-white p-3">
    <div className="text-[11px] font-medium uppercase text-ui-fg-subtle">
      {label}
    </div>
    <div className="mt-1 text-small-semi text-ui-fg-base">{value}</div>
  </div>
)

export default SellerProfileTemplate
