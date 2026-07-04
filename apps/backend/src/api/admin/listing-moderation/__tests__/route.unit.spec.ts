import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { GET } from "../route"

const createResponse = () => {
  const res = {
    json: jest.fn(),
  }

  return res
}

describe("admin listing moderation list route", () => {
  it("resolves reviewer user details for reviewed listings", async () => {
    const query = {
      graph: jest.fn(({ entity }) => {
        if (entity === "product") {
          return Promise.resolve({
            data: [
              {
                id: "prod_123",
                title: "Jasmine rice",
                handle: "jasmine-rice",
                description: "Fresh harvest",
                thumbnail: null,
                listing: {
                  id: "listing_123",
                  status: "active",
                  moderation_note: null,
                  reviewed_at: "2026-06-02T10:15:00.000Z",
                  reviewer_id: "user_123",
                  category: "Produce",
                  location: "Takeo",
                  quantity: null,
                  unit: null,
                  condition: null,
                  created_at: "2026-06-01T10:15:00.000Z",
                  updated_at: "2026-06-02T10:15:00.000Z",
                },
                seller: null,
                variants: [],
              },
            ],
            metadata: { count: 1 },
          })
        }

        if (entity === "user") {
          return Promise.resolve({
            data: [
              {
                id: "user_123",
                email: "admin@example.com",
                first_name: "Ada",
                last_name: "Lovelace",
              },
            ],
          })
        }

        return Promise.resolve({ data: [] })
      }),
    }
    const req = {
      scope: {
        resolve: jest.fn((key) =>
          key === ContainerRegistrationKeys.QUERY ? query : null
        ),
      },
    }
    const res = createResponse()

    await GET(req as never, res as never)

    expect(query.graph).toHaveBeenCalledWith(
      expect.objectContaining({
        entity: "user",
        filters: {
          id: ["user_123"],
        },
      })
    )
    expect(res.json).toHaveBeenCalledWith({
      listings: [
        expect.objectContaining({
          id: "listing_123",
          reviewer_id: "user_123",
          reviewer: {
            id: "user_123",
            email: "admin@example.com",
            first_name: "Ada",
            last_name: "Lovelace",
          },
        }),
      ],
    })
  })
})
