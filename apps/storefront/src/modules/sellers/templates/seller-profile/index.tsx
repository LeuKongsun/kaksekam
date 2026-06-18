import { SellerProfile } from "@lib/data/sellers"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type SellerProfileTemplateProps = {
  profile: SellerProfile
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
    <div className="mx-auto w-full max-w-[1120px] py-10">
      <section className="border-b border-ui-border-base pb-8">
        <div className="flex flex-col gap-8 medium:flex-row medium:items-start medium:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl-semi text-ui-fg-base">
                {seller.display_name}
              </h1>
              {seller.verification_status === "verified" && (
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-medium uppercase text-green-700">
                  Verified
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-base-regular text-ui-fg-subtle">
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
          </div>

          <div className="min-w-[220px] text-small-regular text-ui-fg-subtle">
            <div className="text-2xl-semi text-ui-fg-base">
              {listings.length}
            </div>
            <div>active listing{listings.length === 1 ? "" : "s"}</div>
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

        <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-ui-border-base pt-5 text-small-regular small:grid-cols-4">
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
        </dl>
      </section>

      {listings.length === 0 ? (
        <div className="mt-8 rounded-md border border-gray-200 p-4 text-base-regular text-ui-fg-subtle">
          This farmer has no active listings.
        </div>
      ) : (
        <section className="pt-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl-semi text-ui-fg-base">Seller listings</h2>
              <p className="mt-1 text-small-regular text-ui-fg-subtle">
                Contact the seller from a listing to ask questions or arrange
                details.
              </p>
            </div>
          </div>
          <ul className="grid grid-cols-1 gap-5 small:grid-cols-2 medium:grid-cols-3">
            {listings.map((listing) => {
              const details = formatListingDetails(listing).slice(0, 4)

              return (
                <li key={listing.id}>
                  <LocalizedClientLink
                    href={`/products/${listing.handle}`}
                    className="group block overflow-hidden rounded-md border border-gray-200 bg-white transition-colors hover:border-ui-fg-base"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                      {listing.thumbnail && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={listing.thumbnail}
                          alt={listing.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="text-base-semi text-ui-fg-base">
                        {listing.title}
                      </div>
                      {listing.description && (
                        <p className="mt-1 line-clamp-2 text-small-regular text-ui-fg-subtle">
                          {listing.description}
                        </p>
                      )}
                      {details.length > 0 && (
                        <p className="mt-3 text-small-regular text-ui-fg-subtle">
                          {details.join(" / ")}
                        </p>
                      )}
                    </div>
                  </LocalizedClientLink>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}

const TrustStat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-[11px] font-medium uppercase text-ui-fg-subtle">
      {label}
    </dt>
    <dd className="mt-1 text-small-semi text-ui-fg-base">{value}</dd>
  </div>
)

export default SellerProfileTemplate
