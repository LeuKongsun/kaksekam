import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

type InquiryProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  listing?: {
    id: string
    status: string
  } | null
}

async function getInquiryProduct(query: any, productId: string) {
  const { data } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "thumbnail",
      "listing.id",
      "listing.status",
    ],
    filters: {
      id: productId,
    },
  })

  return (data[0] as InquiryProduct | undefined) ?? null
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const customerId = req.auth_context.actor_id
  const [seller] = await marketplaceService.listSellers({
    customer_id: customerId,
  })

  if (!seller) {
    res.json({ inquiries: [] })
    return
  }

  const inquiries = await marketplaceService.listListingInquiries({
    seller_id: seller.id,
  })
  const products = await Promise.all(
    inquiries.map((inquiry) => getInquiryProduct(query, inquiry.product_id))
  )
  const productById = new Map(
    products.filter(Boolean).map((product) => [product!.id, product])
  )

  res.json({
    inquiries: inquiries
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((inquiry) => ({
        ...inquiry,
        product: productById.get(inquiry.product_id) ?? null,
      })),
  })
}
