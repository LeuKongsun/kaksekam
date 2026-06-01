import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
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
  seller?: {
    id: string
    display_name: string
    handle: string
    verification_status: string
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
      "seller.id",
      "seller.display_name",
      "seller.handle",
      "seller.verification_status",
    ],
    filters: {
      id: productId,
    },
  })

  return (data[0] as InquiryProduct | undefined) ?? null
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const inquiries = await marketplaceService.listListingInquiries({})
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
