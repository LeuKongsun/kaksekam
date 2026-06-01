import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

type MarketplaceProduct = {
  id: string
  listing?: {
    id: string
    status: string
    created_at: string
  } | null
  seller?: {
    id: string
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
      fields: ["id", "listing.id", "listing.status", "listing.created_at", "seller.id"],
      pagination: {
        skip,
        take: PAGE_SIZE,
      },
    })

    products.push(
      ...(data as MarketplaceProduct[]).filter((product) => product.listing)
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

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const [products, sellers, inquiries, savedListings, savedSearches] =
    await Promise.all([
      listMarketplaceProducts(query),
      marketplaceService.listSellers({}),
      marketplaceService.listListingInquiries({}),
      marketplaceService.listSavedListings({}),
      marketplaceService.listSavedSearches({}),
    ])
  const listingStatusCounts = getListingStatusCounts(products)
  const newInquiryCount = inquiries.filter(
    (inquiry) => inquiry.status === "new"
  ).length
  const repliedInquiryCount = inquiries.filter(
    (inquiry) => inquiry.status === "replied"
  ).length

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
          (seller) => seller.verification_status === "verified"
        ).length,
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
    },
    attention: {
      pending_listings: listingStatusCounts.pending_review ?? 0,
      new_inquiries: newInquiryCount,
      unverified_sellers: sellers.filter(
        (seller) => seller.verification_status !== "verified"
      ).length,
    },
  })
}
