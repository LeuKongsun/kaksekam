import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"

type UpdateListingReportBody = {
  status?: "resolved" | "dismissed"
  resolution_note?: string
}

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateListingReportBody>,
  res: MedusaResponse
) {
  const status = req.body.status

  if (status !== "resolved" && status !== "dismissed") {
    res.status(400).json({ message: "Choose resolved or dismissed." })
    return
  }

  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)
  const report = await marketplaceService
    .retrieveListingReport(req.params.id)
    .catch(() => null)

  if (!report) {
    res.status(404).json({ message: "Report not found." })
    return
  }

  const updated = await marketplaceService.updateListingReports({
    id: report.id,
    status,
    resolution_note: req.body.resolution_note?.trim().slice(0, 1000) || null,
    reviewed_by: req.auth_context.actor_id,
    reviewed_at: new Date(),
  })

  res.json({ report: updated })
}
