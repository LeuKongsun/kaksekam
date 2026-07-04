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
  seller?: {
    id: string
    display_name: string
    handle: string
  } | null
}

async function getInquiryMessages(
  marketplaceService: MarketplaceModuleService,
  inquiryId: string
) {
  const messages = await marketplaceService.listListingInquiryMessages({
    inquiry_id: inquiryId,
  })

  return messages.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
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
  const inquiries = await marketplaceService.listListingInquiries({
    customer_id: customerId,
  })
  const products = await Promise.all(
    inquiries.map((inquiry) => getInquiryProduct(query, inquiry.product_id))
  )
  const messages = await Promise.all(
    inquiries.map((inquiry) => getInquiryMessages(marketplaceService, inquiry.id))
  )
  const productById = new Map(
    products.filter(Boolean).map((product) => [product!.id, product])
  )
  const messagesByInquiryId = new Map(
    inquiries.map((inquiry, index) => [inquiry.id, messages[index]])
  )

  res.json({
    inquiries: inquiries
      .sort(
        (a, b) =>
          new Date(b.last_message_at ?? b.created_at).getTime() -
          new Date(a.last_message_at ?? a.created_at).getTime()
      )
      .map((inquiry) => ({
        ...inquiry,
        product: productById.get(inquiry.product_id) ?? null,
        messages: messagesByInquiryId.get(inquiry.id) ?? [],
      })),
  })
}
