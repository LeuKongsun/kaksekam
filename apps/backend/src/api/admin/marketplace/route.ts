import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

type MarketplaceProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  images?: {
    url: string
  }[] | null
  listing?: {
    id: string
    status: string
    created_at: string
    category: string | null
    location: string | null
  } | null
  seller?: {
    id: string
    display_name: string
    verification_status: string
  } | null
}

const PAGE_SIZE = 100

async function listMarketplaceProducts(query: any) {
  const products: MarketplaceProduct[] = []
  let skip = 0
  let totalCount: number | undefined
  let hasMoreProducts = true

  while (hasMoreProducts) {
    const { data, metadata } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "thumbnail",
        "images.url",
        "listing.id",
        "listing.status",
        "listing.created_at",
        "listing.category",
        "listing.location",
        "seller.id",
        "seller.display_name",
        "seller.verification_status",
      ],
      pagination: {
        skip,
        take: PAGE_SIZE,
      },
    })

    products.push(
      ...(data as MarketplaceProduct[]).filter(
        (product) => product.listing?.category
      ),
    )

    totalCount = metadata?.count
    skip += data.length
    hasMoreProducts =
      data.length > 0 &&
      (totalCount === undefined ? data.length === PAGE_SIZE : skip < totalCount)
  }

  return products
}

const getListingStatusCounts = (products: MarketplaceProduct[]) =>
  products.reduce<Record<string, number>>((acc, product) => {
    const status = product.listing?.status

    if (status) {
      acc[status] = (acc[status] ?? 0) + 1
    }

    return acc
  }, {})

const getRecentListings = (products: MarketplaceProduct[]) =>
  [...products]
    .sort((left, right) => {
      const leftTime = left.listing?.created_at
        ? new Date(left.listing.created_at).getTime()
        : 0
      const rightTime = right.listing?.created_at
        ? new Date(right.listing.created_at).getTime()
        : 0

      return rightTime - leftTime
    })
    .slice(0, 6)

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const [
    products,
    sellers,
    inquiries,
    savedListings,
    savedSearches,
    contactEvents,
    listingReports,
  ] =
    await Promise.all([
      listMarketplaceProducts(query),
      marketplaceService.listSellers({}),
      marketplaceService.listListingInquiries({}),
      marketplaceService.listSavedListings({}),
      marketplaceService.listSavedSearches({}),
      marketplaceService.listContactEvents({}),
      marketplaceService.listListingReports({}),
    ])
  const listingStatusCounts = getListingStatusCounts(products)
  const newInquiryCount = inquiries.filter(
    (inquiry) => inquiry.status === "new",
  ).length
  const repliedInquiryCount = inquiries.filter(
    (inquiry) => inquiry.status === "replied",
  ).length
  const contactedListingIds = new Set(
    contactEvents.map((event) => event.listing_id)
  )
  const activeListingIds = products
    .filter((product) => product.listing?.status === "active")
    .map((product) => product.listing!.id)
  const listingsBySeller = products.reduce<Record<string, number>>(
    (counts, product) => {
      if (product.seller?.id) {
        counts[product.seller.id] = (counts[product.seller.id] ?? 0) + 1
      }
      return counts
    },
    {}
  )
  const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000

  res.json({
    metrics: {
      listings: {
        total: products.length,
        active: listingStatusCounts.active ?? 0,
        pending_review: listingStatusCounts.pending_review ?? 0,
        rejected: listingStatusCounts.rejected ?? 0,
        sold: listingStatusCounts.sold ?? 0,
        expired: listingStatusCounts.expired ?? 0,
      },
      sellers: {
        total: sellers.length,
        active: sellers.filter((seller) => seller.status === "active").length,
        suspended: sellers.filter((seller) => seller.status === "suspended")
          .length,
        verified: sellers.filter(
          (seller) => seller.verification_status === "verified",
        ).length,
        repeat: Object.values(listingsBySeller).filter((count) => count > 1)
          .length,
      },
      inquiries: {
        total: inquiries.length,
        new: newInquiryCount,
        replied: repliedInquiryCount,
        reply_rate:
          inquiries.length === 0
            ? null
            : Math.round((repliedInquiryCount / inquiries.length) * 100),
      },
      saved: {
        listings: savedListings.length,
        searches: savedSearches.length,
      },
      contacts: {
        total: contactEvents.length,
        telegram: contactEvents.filter((event) => event.channel === "telegram")
          .length,
        messenger: contactEvents.filter(
          (event) => event.channel === "messenger"
        ).length,
        phone: contactEvents.filter((event) => event.channel === "phone").length,
        listings_contacted: new Set(
          contactEvents.map((event) => event.listing_id)
        ).size,
        last_14_days: contactEvents.filter(
          (event) => new Date(event.created_at).getTime() >= fourteenDaysAgo
        ).length,
        active_listing_contact_rate:
          activeListingIds.length === 0
            ? null
            : Math.round(
                (activeListingIds.filter((id) => contactedListingIds.has(id))
                  .length /
                  activeListingIds.length) *
                  100
              ),
      },
      reports: {
        total: listingReports.length,
        new: listingReports.filter((report) => report.status === "new").length,
      },
    },
    attention: {
      pending_listings: listingStatusCounts.pending_review ?? 0,
      new_inquiries: newInquiryCount,
      new_reports: listingReports.filter((report) => report.status === "new")
        .length,
      unverified_sellers: sellers.filter(
        (seller) => seller.verification_status !== "verified",
      ).length,
    },
    recent_listings: getRecentListings(products).map((product) => ({
      id: product.listing!.id,
      product_id: product.id,
      title: product.title,
      handle: product.handle,
      thumbnail: product.thumbnail,
      images: product.images ?? [],
      status: product.listing!.status,
      category: product.listing!.category,
      location: product.listing!.location,
      created_at: product.listing!.created_at,
      seller: product.seller
        ? {
            id: product.seller.id,
            display_name: product.seller.display_name,
            verification_status: product.seller.verification_status,
          }
        : null,
    })),
  })
}
