import { HttpTypes } from "@medusajs/types"
import type { ProductSeller } from "@lib/data/products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Eye from "@modules/common/icons/eye"
import Package from "@modules/common/icons/package"
import User from "@modules/common/icons/user"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  seller: ProductSeller | null
  metrics: {
    listings: number
    activeListings: number
    pendingListings: number
    sellerInquiries: number
    newSellerInquiries: number
    buyerInquiries: number
    savedListings: number
    savedSearches: number
  }
}

const Overview = ({ customer, seller, metrics }: OverviewProps) => {
  const sellerCompletion = getSellerProfileCompletion(seller)
  const primaryActions = [
    {
      title: "Listings",
      href: "/account/listings",
      icon: Package,
    },
    {
      title: "Messages",
      href: "/account/inquiries",
      icon: MessageIcon,
    },
    {
      title: "Browse",
      href: "/store",
      icon: Eye,
    },
  ]
  const stats = [
    {
      label: "Listings",
      value: metrics.listings,
      detail: `${metrics.activeListings} active, ${metrics.pendingListings} pending`,
      icon: Package,
    },
    {
      label: "Inbox",
      value: metrics.sellerInquiries,
      detail:
        metrics.newSellerInquiries > 0
          ? `${metrics.newSellerInquiries} new`
          : "All caught up",
      icon: MessageIcon,
    },
    {
      label: "Sent",
      value: metrics.buyerInquiries,
      detail: "To sellers",
      icon: MessageIcon,
    },
    {
      label: "Saved",
      value: metrics.savedListings + metrics.savedSearches,
      detail: `${metrics.savedListings} listings, ${metrics.savedSearches} searches`,
      icon: Eye,
    },
  ]

  return (
    <div className="w-full" data-testid="overview-page-wrapper">
      <div className="rounded-md border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 small:flex-row small:items-center small:justify-between">
          <div>
            <h2
              className="text-xl-semi"
              data-testid="welcome-message"
              data-value={customer?.first_name}
            >
              Overview
            </h2>
            <p className="mt-1 text-small-regular text-ui-fg-subtle">
              Hi {customer?.first_name}
            </p>
          </div>
          <div className="text-small-regular text-ui-fg-subtle small:text-right">
            <span
              className="block text-base-semi text-ui-fg-base"
              data-testid="customer-email"
              data-value={customer?.email}
            >
              {customer?.email}
            </span>
            Signed in
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-5">
          <div className="flex flex-wrap gap-2">
            {primaryActions.map((action) => {
              const Icon = action.icon

              return (
                <LocalizedClientLink
                  key={action.href}
                  href={action.href}
                  className="inline-flex h-9 items-center gap-x-2 rounded-md border border-gray-200 px-3 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base hover:bg-gray-50"
                >
                  <Icon size={15} />
                  {action.title}
                </LocalizedClientLink>
              )
            })}
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 small:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="min-w-0"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-[11px] font-medium uppercase text-ui-fg-subtle">
                    {stat.label}
                  </span>
                  <span className="text-xl-semi text-ui-fg-base">
                    {stat.value}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-small-regular text-ui-fg-subtle">
                  {stat.detail}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-5">
          <div className="flex flex-col gap-4 small:flex-row small:items-center small:justify-between">
            <div>
              <h3 className="text-large-semi">Seller profile</h3>
            </div>
            <p className="text-small-regular text-ui-fg-subtle">
              <span
                className="text-xl-semi text-ui-fg-base"
                data-testid="seller-profile-completion"
                data-value={sellerCompletion}
              >
                {sellerCompletion}%
              </span>{" "}
              complete
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <LocalizedClientLink
              href="/account/seller-profile"
              className="inline-flex items-center gap-x-2 text-small-semi text-ui-fg-base hover:text-ui-fg-interactive"
            >
              <User size={14} />
              Profile
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/account/saved"
              className="inline-flex items-center gap-x-2 text-small-semi text-ui-fg-base hover:text-ui-fg-interactive"
            >
              <Eye size={14} />
              Saved
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}

const getSellerProfileCompletion = (seller: ProductSeller | null) => {
  if (!seller) {
    return 0
  }

  const fields = [
    seller.display_name,
    seller.handle,
    seller.email,
    seller.phone,
    seller.location,
    seller.bio,
  ]
  const completed = fields.filter(Boolean).length

  return Math.round((completed / fields.length) * 100)
}

function MessageIcon({
  size = 16,
  className,
}: {
  size?: string | number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4.25 5.25C4.25 4.55964 4.80964 4 5.5 4H14.5C15.1904 4 15.75 4.55964 15.75 5.25V11.25C15.75 11.9404 15.1904 12.5 14.5 12.5H9L5.75 15.25V12.5H5.5C4.80964 12.5 4.25 11.9404 4.25 11.25V5.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default Overview
