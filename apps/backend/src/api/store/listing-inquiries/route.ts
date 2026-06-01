import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

type CreateListingInquiryBody = {
  product_id?: string
  buyer_name?: string
  buyer_email?: string
  buyer_phone?: string
  message?: string
}

type InquiryProduct = {
  id: string
  listing?: {
    id: string
    status: string
  } | null
  seller?: {
    id: string
    status: string
  } | null
}

async function getActiveInquiryProduct(query: any, productId: string) {
  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "listing.id", "listing.status", "seller.id", "seller.status"],
    filters: {
      id: productId,
    },
  })
  const product = data[0] as InquiryProduct | undefined

  if (
    !product?.listing ||
    product.listing.status !== "active" ||
    !product.seller ||
    product.seller.status !== "active"
  ) {
    return null
  }

  return product
}

export async function POST(
  req: MedusaRequest<CreateListingInquiryBody>,
  res: MedusaResponse
) {
  const body = req.body
  const productId = body.product_id?.trim()
  const buyerName = body.buyer_name?.trim()
  const buyerEmail = body.buyer_email?.trim()
  const buyerPhone = body.buyer_phone?.trim() || null
  const message = body.message?.trim()

  if (!productId || !buyerName || !buyerEmail || !message) {
    res.status(400).json({
      message: "Name, email, message, and listing are required.",
    })
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const customerId =
    (req as MedusaRequest<CreateListingInquiryBody> & {
      auth_context?: { actor_id?: string }
    }).auth_context?.actor_id ?? null
  const product = await getActiveInquiryProduct(query, productId)

  if (!product?.listing || !product.seller) {
    res.status(404).json({ message: "Active listing not found." })
    return
  }

  const inquiry = await marketplaceService.createListingInquiries({
    listing_id: product.listing.id,
    product_id: product.id,
    seller_id: product.seller.id,
    customer_id: customerId,
    buyer_name: buyerName,
    buyer_email: buyerEmail,
    buyer_phone: buyerPhone,
    message,
    status: "new",
    replied_at: null,
  })

  res.status(201).json({ inquiry })
}
