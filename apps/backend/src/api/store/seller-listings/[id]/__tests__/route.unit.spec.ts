import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  updateProductsWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows"

import { MARKETPLACE_MODULE } from "../../../../../modules/marketplace"
import { DELETE, PATCH } from "../route"

jest.mock("@medusajs/medusa/core-flows", () => ({
  updateProductsWorkflow: jest.fn(),
  updateProductVariantsWorkflow: jest.fn(),
}))

const mockedUpdateProductsWorkflow = jest.mocked(updateProductsWorkflow)
const mockedUpdateProductVariantsWorkflow = jest.mocked(
  updateProductVariantsWorkflow
)
let runUpdateProductsWorkflow: jest.Mock
let runUpdateProductVariantsWorkflow: jest.Mock

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

describe("store seller listing route", () => {
  beforeEach(() => {
    runUpdateProductsWorkflow = jest.fn().mockResolvedValue({})
    runUpdateProductVariantsWorkflow = jest.fn().mockResolvedValue({})
    mockedUpdateProductsWorkflow.mockReturnValue({
      run: runUpdateProductsWorkflow,
    } as never)
    mockedUpdateProductVariantsWorkflow.mockReturnValue({
      run: runUpdateProductVariantsWorkflow,
    } as never)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("clears review audit metadata when a seller resubmits an edited listing", async () => {
    const query = {
      graph: jest.fn().mockResolvedValue({
        data: [
          {
            id: "prod_123",
            seller: {
              id: "seller_123",
              customer_id: "cus_123",
            },
            listing: {
              id: "listing_123",
              status: "active",
              moderation_note: null,
            },
            variants: [{ id: "variant_123" }],
          },
        ],
        metadata: { count: 1 },
      }),
    }
    const marketplaceService = {
      updateListings: jest.fn().mockResolvedValue({
        id: "listing_123",
        status: "pending_review",
        reviewed_at: null,
        reviewer_id: null,
      }),
    }
    const scope = createScope({ query, marketplaceService })
    const req = {
      params: { id: "listing_123" },
      auth_context: { actor_id: "cus_123" },
      scope,
      body: {
        title: " Updated listing ",
        description: " Updated description ",
        image_urls: "https://example.com/listing.jpg",
        price: "1250",
        currency_code: "EUR",
        category: " Produce ",
        location: " Takeo ",
      },
    }
    const res = createResponse()

    await PATCH(req as never, res as never)

    expect(runUpdateProductsWorkflow).toHaveBeenCalledWith({
      input: {
        products: [
          {
            id: "prod_123",
            title: "Updated listing",
            description: "Updated description",
            thumbnail: "https://example.com/listing.jpg",
            images: [{ url: "https://example.com/listing.jpg" }],
          },
        ],
      },
    })
    expect(runUpdateProductVariantsWorkflow).toHaveBeenCalledWith({
      input: {
        product_variants: [
          {
            id: "variant_123",
            prices: [
              {
                amount: 1250,
                currency_code: "eur",
              },
            ],
          },
        ],
      },
    })
    expect(marketplaceService.updateListings).toHaveBeenCalledWith({
      id: "listing_123",
      status: "pending_review",
      moderation_note: null,
      reviewed_at: null,
      reviewer_id: null,
      category: "Produce",
      location: "Takeo",
      quantity: null,
      unit: null,
      condition: null,
    })
    expect(res.json).toHaveBeenCalledWith({
      listing: {
        id: "listing_123",
        status: "pending_review",
        reviewed_at: null,
        reviewer_id: null,
      },
    })
  })

  it("clears review audit metadata when a seller withdraws a listing", async () => {
    const query = {
      graph: jest.fn().mockResolvedValue({
        data: [
          {
            id: "prod_123",
            seller: {
              id: "seller_123",
              customer_id: "cus_123",
            },
            listing: {
              id: "listing_123",
              status: "rejected",
              moderation_note: "Needs clearer photos",
            },
          },
        ],
        metadata: { count: 1 },
      }),
    }
    const marketplaceService = {
      updateListings: jest.fn().mockResolvedValue({
        id: "listing_123",
        status: "expired",
        reviewed_at: null,
        reviewer_id: null,
      }),
    }
    const scope = createScope({ query, marketplaceService })
    const req = {
      params: { id: "listing_123" },
      auth_context: { actor_id: "cus_123" },
      scope,
    }
    const res = createResponse()

    await DELETE(req as never, res as never)

    expect(marketplaceService.updateListings).toHaveBeenCalledWith({
      id: "listing_123",
      status: "expired",
      moderation_note: null,
      reviewed_at: null,
      reviewer_id: null,
    })
    expect(res.json).toHaveBeenCalledWith({
      listing: {
        id: "listing_123",
        status: "expired",
        reviewed_at: null,
        reviewer_id: null,
      },
    })
  })
})
