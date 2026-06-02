import { ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

import { MARKETPLACE_MODULE } from "../../../../../modules/marketplace"
import { POST } from "../route"

jest.mock("@medusajs/medusa/core-flows", () => ({
  updateProductsWorkflow: jest.fn(),
}))

const mockedUpdateProductsWorkflow = jest.mocked(updateProductsWorkflow)
let runUpdateProductsWorkflow: jest.Mock

const createResponse = () => {
  const res = {
    json: jest.fn(),
    status: jest.fn(),
  }
  res.status.mockReturnValue(res)

  return res
}

describe("admin listing moderation route", () => {
  const now = new Date("2026-06-02T10:15:00.000Z")

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now)
    runUpdateProductsWorkflow = jest.fn().mockResolvedValue({})
    mockedUpdateProductsWorkflow.mockReturnValue({
      run: runUpdateProductsWorkflow,
    } as never)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it("stamps review audit metadata when approving a listing", async () => {
    const query = {
      graph: jest.fn().mockResolvedValue({
        data: [{ id: "prod_123", listing: { id: "listing_123" } }],
        metadata: { count: 1 },
      }),
    }
    const marketplaceService = {
      updateListings: jest.fn().mockResolvedValue({
        id: "listing_123",
        status: "active",
        reviewed_at: now,
        reviewer_id: "user_123",
      }),
    }
    const req = {
      params: { id: "listing_123" },
      body: { status: "active" },
      auth_context: { actor_id: "user_123" },
      scope: {
        resolve: jest.fn((key) => {
          if (key === ContainerRegistrationKeys.QUERY) {
            return query
          }

          if (key === MARKETPLACE_MODULE) {
            return marketplaceService
          }

          return null
        }),
      },
    }
    const res = createResponse()

    await POST(req as never, res as never)

    expect(marketplaceService.updateListings).toHaveBeenCalledWith({
      id: "listing_123",
      status: "active",
      moderation_note: null,
      reviewed_at: now,
      reviewer_id: "user_123",
    })
    expect(mockedUpdateProductsWorkflow).toHaveBeenCalledWith(req.scope)
    expect(runUpdateProductsWorkflow).toHaveBeenCalledWith({
      input: {
        products: [
          {
            id: "prod_123",
            status: ProductStatus.PUBLISHED,
          },
        ],
      },
    })
    expect(res.json).toHaveBeenCalledWith({
      listing: {
        id: "listing_123",
        status: "active",
        reviewed_at: now,
        reviewer_id: "user_123",
      },
    })
  })

  it("stamps audit metadata and preserves the rejection note when rejecting", async () => {
    const query = {
      graph: jest.fn().mockResolvedValue({
        data: [{ id: "prod_123", listing: { id: "listing_123" } }],
        metadata: { count: 1 },
      }),
    }
    const marketplaceService = {
      updateListings: jest.fn().mockResolvedValue({
        id: "listing_123",
        status: "rejected",
        moderation_note: "Needs clearer photos",
        reviewed_at: now,
        reviewer_id: null,
      }),
    }
    const req = {
      params: { id: "listing_123" },
      body: {
        status: "rejected",
        moderation_note: "  Needs clearer photos  ",
      },
      scope: {
        resolve: jest.fn((key) => {
          if (key === ContainerRegistrationKeys.QUERY) {
            return query
          }

          if (key === MARKETPLACE_MODULE) {
            return marketplaceService
          }

          return null
        }),
      },
    }
    const res = createResponse()

    await POST(req as never, res as never)

    expect(marketplaceService.updateListings).toHaveBeenCalledWith({
      id: "listing_123",
      status: "rejected",
      moderation_note: "Needs clearer photos",
      reviewed_at: now,
      reviewer_id: null,
    })
    expect(runUpdateProductsWorkflow).toHaveBeenCalledWith({
      input: {
        products: [
          {
            id: "prod_123",
            status: ProductStatus.DRAFT,
          },
        ],
      },
    })
  })
})
