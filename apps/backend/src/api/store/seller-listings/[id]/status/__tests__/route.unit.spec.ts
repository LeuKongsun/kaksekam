import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

import { MARKETPLACE_MODULE } from "../../../../../../modules/marketplace"
import { PATCH } from "../route"

jest.mock("@medusajs/medusa/core-flows", () => ({
  updateProductsWorkflow: jest.fn(),
}))

const mockedUpdateProductsWorkflow = jest.mocked(updateProductsWorkflow)

const createResponse = () => {
  const res = {
    json: jest.fn(),
    status: jest.fn(),
  }
  res.status.mockReturnValue(res)
  return res
}

const createScope = ({
  query,
  marketplaceService,
}: {
  query: unknown
  marketplaceService: unknown
}) => ({
  resolve: jest.fn((key) => {
    if (key === ContainerRegistrationKeys.QUERY) {
      return query
    }
    if (key === MARKETPLACE_MODULE) {
      return marketplaceService
    }
    return null
  }),
})

describe("PATCH /store/seller-listings/:id/status", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUpdateProductsWorkflow.mockReturnValue({
      run: jest.fn().mockResolvedValue({}),
    } as never)
  })

  it("republishes expired listings for review", async () => {
    const query = {
      graph: jest.fn().mockResolvedValue({
        data: [
          {
            id: "prod_123",
            seller: { customer_id: "cus_123" },
            listing: { id: "listing_123", status: "expired" },
          },
        ],
        metadata: { count: 1 },
      }),
    }
    const marketplaceService = {
      updateListings: jest.fn().mockResolvedValue({
        id: "listing_123",
        status: "pending_review",
      }),
    }
    const req = {
      params: { id: "listing_123" },
      auth_context: { actor_id: "cus_123" },
      body: { action: "republish" },
      scope: createScope({ query, marketplaceService }),
    }
    const res = createResponse()

    await PATCH(req as never, res as never)

    expect(marketplaceService.updateListings).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "listing_123",
        status: "pending_review",
        expires_at: expect.any(Date),
        refreshed_at: expect.any(Date),
      })
    )
    expect(res.json).toHaveBeenCalledWith({
      listing: {
        id: "listing_123",
        status: "pending_review",
      },
    })
  })

  it("rejects republish for active listings", async () => {
    const query = {
      graph: jest.fn().mockResolvedValue({
        data: [
          {
            id: "prod_123",
            seller: { customer_id: "cus_123" },
            listing: { id: "listing_123", status: "active" },
          },
        ],
        metadata: { count: 1 },
      }),
    }
    const marketplaceService = {
      updateListings: jest.fn(),
    }
    const req = {
      params: { id: "listing_123" },
      auth_context: { actor_id: "cus_123" },
      body: { action: "republish" },
      scope: createScope({ query, marketplaceService }),
    }
    const res = createResponse()

    await PATCH(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(409)
    expect(marketplaceService.updateListings).not.toHaveBeenCalled()
  })
})
