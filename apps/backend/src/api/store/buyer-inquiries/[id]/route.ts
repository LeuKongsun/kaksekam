import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"

type CreateBuyerMessageBody = {
  message?: string
}

export async function POST(
  req: AuthenticatedMedusaRequest<CreateBuyerMessageBody>,
  res: MedusaResponse
) {
  const inquiryId = req.params.id
  const customerId = req.auth_context.actor_id
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const message =
    typeof req.body.message === "string" ? req.body.message.trim() : ""

  if (!message) {
    res.status(400).json({ message: "Message is required." })
    return
  }

  const [inquiry] = await marketplaceService.listListingInquiries({
    id: inquiryId,
    customer_id: customerId,
  })

  if (!inquiry) {
    res.status(404).json({ message: "Inquiry not found." })
    return
  }

  const inquiryMessage = await marketplaceService.createListingInquiryMessages({
    inquiry_id: inquiry.id,
    sender_type: "buyer",
    sender_id: customerId,
    body: message,
    read_at: null,
  })

  // Re-surface the thread for the seller when the buyer follows up.
  const updatedInquiry = await marketplaceService.updateListingInquiries({
    id: inquiry.id,
    status: "new",
    last_message_at: new Date().toISOString(),
  })

  res
    .status(201)
    .json({ inquiry: updatedInquiry, message: inquiryMessage })
}
