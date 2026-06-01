import { getProfileCompleteness, getSellerTrustStats } from "../utils"

describe("seller trust utils", () => {
  it("calculates profile completeness from public seller fields", () => {
    expect(
      getProfileCompleteness({
        display_name: "Green Valley",
        handle: "green-valley",
        email: "hello@farm.test",
        phone: null,
        location: "Kampong Cham",
        bio: null,
      })
    ).toBe(67)
  })

  it("calculates reply rate from replied inquiries", () => {
    expect(
      getSellerTrustStats(
        { display_name: "Green Valley", handle: "green-valley" },
        [{ status: "new" }, { status: "replied" }, { status: "replied" }]
      )
    ).toMatchObject({
      inquiry_count: 3,
      replied_inquiry_count: 2,
      reply_rate: 67,
    })
  })

  it("uses null reply rate when there is no inquiry history", () => {
    expect(
      getSellerTrustStats(
        { display_name: "Green Valley", handle: "green-valley" },
        []
      ).reply_rate
    ).toBeNull()
  })
})
