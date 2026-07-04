import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"
import {
  ALLOWED_INQUIRY_STATUSES,
  getInquiryReplyUpdate,
  getInquiryStatusUpdate,
} from "../utils"

type UpdateSellerInquiryBody = {
  status?: "new" | "read" | "replied" | "archived"
  reply_message?: string
}

export async function PATCH(
  req: AuthenticatedMedusaRequest<UpdateSellerInquiryBody>,
  res: MedusaResponse
) {
  const inquiryId = req.params.id
  const customerId = req.auth_context.actor_id
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const status = req.body.status
  const replyMessage =
    typeof req.body.reply_message === "string"
      ? req.body.reply_message.trim()
      : undefined

  if (replyMessage !== undefined && !replyMessage) {
    res.status(400).json({ message: "Reply message is required." })
    return
  }

  if (
    replyMessage === undefined &&
    (!status || !ALLOWED_INQUIRY_STATUSES.has(status))
  ) {
    res.status(400).json({ message: "Valid inquiry status is required." })
    return
  }

  const [seller] = await marketplaceService.listSellers({
    customer_id: customerId,
  })

  if (!seller) {
    res.status(404).json({ message: "Seller profile not found." })
    return
  }

  const [inquiry] = await marketplaceService.listListingInquiries({
    id: inquiryId,
    seller_id: seller.id,
  })

  if (!inquiry) {
    res.status(404).json({ message: "Inquiry not found." })
    return
  }

  let updatedInquiry = inquiry

  if (replyMessage !== undefined) {
    await marketplaceService.createListingInquiryMessages({
      inquiry_id: inquiry.id,
      sender_type: "seller",
      sender_id: seller.id,
      body: replyMessage,
      read_at: null,
    })

    updatedInquiry = await marketplaceService.updateListingInquiries({
      id: inquiry.id,
      ...getInquiryReplyUpdate(),
    })
  } else {
    updatedInquiry = await marketplaceService.updateListingInquiries({
      id: inquiry.id,
      ...getInquiryStatusUpdate(status!),
    })
  }

  res.json({ inquiry: updatedInquiry })
}
