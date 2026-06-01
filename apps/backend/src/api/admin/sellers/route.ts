import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

type SellerProduct = {
  id: string
  seller?: {
    id: string
  } | null
  listing?: {
    id: string
    status: string
  } | null
}

const PAGE_SIZE = 100

async function listSellerProducts(query: any) {
  const products: SellerProduct[] = []
  let skip = 0
  let totalCount: number | undefined
  let hasMoreProducts = true

  while (hasMoreProducts) {
    const { data, metadata } = await query.graph({
      entity: "product",
      fields: ["id", "seller.id", "listing.id", "listing.status"],
      pagination: {
        skip,
        take: PAGE_SIZE,
      },
    })

    products.push(...(data as SellerProduct[]).filter((product) => product.seller))

    totalCount = metadata?.count
    skip += data.length
    hasMoreProducts =
      data.length > 0 &&
      (totalCount === undefined ? data.length === PAGE_SIZE : skip < totalCount)
  }

  return products
}

const getListingStats = (sellerId: string, products: SellerProduct[]) => {
  const sellerProducts = products.filter(
    (product) => product.seller?.id === sellerId && product.listing
  )

  return {
    total: sellerProducts.length,
    active: sellerProducts.filter((product) => product.listing?.status === "active")
      .length,
    pending: sellerProducts.filter(
      (product) => product.listing?.status === "pending_review"
    ).length,
    rejected: sellerProducts.filter(
      (product) => product.listing?.status === "rejected"
    ).length,
  }
}

const getInquiryStats = (
  sellerId: string,
  inquiries: { seller_id: string; status: string }[]
) => {
  const sellerInquiries = inquiries.filter(
    (inquiry) => inquiry.seller_id === sellerId
  )
  const replied = sellerInquiries.filter(
    (inquiry) => inquiry.status === "replied"
  ).length

  return {
    total: sellerInquiries.length,
    replied,
    reply_rate:
      sellerInquiries.length === 0
        ? null
        : Math.round((replied / sellerInquiries.length) * 100),
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const [sellers, products, inquiries] = await Promise.all([
    marketplaceService.listSellers({}),
    listSellerProducts(query),
    marketplaceService.listListingInquiries({}),
  ])

  res.json({
    sellers: sellers
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((seller) => ({
        id: seller.id,
        display_name: seller.display_name,
        handle: seller.handle,
        email: seller.email,
        phone: seller.phone,
        location: seller.location,
        bio: seller.bio,
        status: seller.status,
        verification_status: seller.verification_status,
        created_at: seller.created_at,
        listing_stats: getListingStats(seller.id, products),
        inquiry_stats: getInquiryStats(seller.id, inquiries),
      })),
  })
}
