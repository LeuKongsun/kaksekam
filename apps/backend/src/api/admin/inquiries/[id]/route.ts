import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"
import {
  ALLOWED_INQUIRY_STATUSES,
  getInquiryStatusUpdate,
} from "../../../store/seller-inquiries/utils"

type UpdateInquiryBody = {
  status?: "new" | "read" | "replied" | "archived"
}

export async function POST(
  req: MedusaRequest<UpdateInquiryBody>,
  res: MedusaResponse
) {
  const inquiryId = req.params.id
  const status = req.body.status

  if (!status || !ALLOWED_INQUIRY_STATUSES.has(status)) {
    res.status(400).json({ message: "Valid inquiry status is required." })
    return
  }

  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const [inquiry] = await marketplaceService.listListingInquiries({
    id: inquiryId,
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
