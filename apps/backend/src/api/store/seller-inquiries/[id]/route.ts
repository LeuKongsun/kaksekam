import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"
import {
  ALLOWED_INQUIRY_STATUSES,
  getInquiryStatusUpdate,
} from "../utils"

type UpdateSellerInquiryBody = {
  status?: "new" | "read" | "replied" | "archived"
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

  if (!status || !ALLOWED_INQUIRY_STATUSES.has(status)) {
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

  const updatedInquiry = await marketplaceService.updateListingInquiries({
    id: inquiry.id,
    ...getInquiryStatusUpdate(status),
  })

  res.json({ inquiry: updatedInquiry })
}
