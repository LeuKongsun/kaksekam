import { HttpTypes } from "@medusajs/types"
import type { ProductSeller } from "@lib/data/products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

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
      title: "Post a listing",
      description:
        "Create or edit farming product, livestock, supply, or service listings.",
      href: "/account/listings",
      cta: "Manage listings",
    },
    {
      title: "Reply to inquiries",
      description: "Review buyer messages and keep listing conversations moving.",
      href: "/account/inquiries",
      cta: "Open inbox",
    },
    {
      title: "Browse as a buyer",
      description: "Search active marketplace listings and save useful filters.",
      href: "/store",
      cta: "Browse listings",
    },
  ]
  const stats = [
    {
      label: "My listings",
      value: metrics.listings,
      detail: `${metrics.activeListings} active, ${metrics.pendingListings} pending`,
    },
    {
      label: "Seller inquiries",
      value: metrics.sellerInquiries,
      detail:
        metrics.newSellerInquiries > 0
          ? `${metrics.newSellerInquiries} new`
          : "No new messages",
    },
    {
      label: "Sent inquiries",
      value: metrics.buyerInquiries,
      detail: "Messages sent to sellers",
    },
    {
      label: "Saved activity",
      value: metrics.savedListings + metrics.savedSearches,
      detail: `${metrics.savedListings} listings, ${metrics.savedSearches} searches`,
    },
  ]

  return (
    <div className="flex flex-col gap-y-6" data-testid="overview-page-wrapper">
      <div className="rounded-md border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-y-2 small:flex-row small:items-start small:justify-between">
          <div>
            <h2 className="text-xl-semi">Marketplace overview</h2>
            <p className="mt-1 text-base-regular text-ui-fg-subtle">
              Track your seller profile, listings, saved searches, and
              inquiries from one workspace.
            </p>
          </div>
          <span data-testid="welcome-message" data-value={customer?.first_name}>
            Hello {customer?.first_name}
          </span>
        </div>
        <div className="mt-4 text-small-regular text-ui-fg-subtle">
          Signed in as:{" "}
          <span
            className="font-semibold"
            data-testid="customer-email"
            data-value={customer?.email}
          >
            {customer?.email}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 small:grid-cols-2 large:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-md border border-gray-200 bg-white p-4"
          >
            <div className="text-small-regular text-ui-fg-subtle">
              {stat.label}
            </div>
            <div className="mt-2 text-3xl-semi text-ui-fg-base">
              {stat.value}
            </div>
            <div className="mt-1 text-small-regular text-ui-fg-subtle">
              {stat.detail}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 small:grid-cols-3">
        {primaryActions.map((action) => (
          <div
            key={action.href}
            className="flex min-h-[180px] flex-col justify-between rounded-md border border-gray-200 bg-white p-5"
          >
            <div>
              <h3 className="text-large-semi">{action.title}</h3>
              <p className="mt-2 text-small-regular text-ui-fg-subtle">
                {action.description}
              </p>
            </div>
            <LocalizedClientLink
              href={action.href}
              className="mt-5 text-base-semi text-ui-fg-base hover:text-ui-fg-interactive"
            >
              {action.cta}
            </LocalizedClientLink>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-y-3 small:flex-row small:items-center small:justify-between">
          <div>
            <h3 className="text-large-semi">Seller profile readiness</h3>
            <p className="mt-1 text-small-regular text-ui-fg-subtle">
              A complete seller profile helps buyers understand who they are
              contacting before they send an inquiry.
            </p>
          </div>
          <div className="text-left small:text-right">
            <div
              className="text-3xl-semi leading-none"
              data-testid="seller-profile-completion"
              data-value={sellerCompletion}
            >
              {sellerCompletion}%
            </div>
            <div className="mt-1 text-small-regular uppercase text-ui-fg-subtle">
              complete
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <LocalizedClientLink
            href="/account/seller-profile"
            className="rounded-full border border-gray-300 px-4 py-2 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base"
          >
            Manage seller profile
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/account/saved"
            className="rounded-full border border-gray-300 px-4 py-2 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base"
          >
            View saved activity
          </LocalizedClientLink>
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

export default Overview
