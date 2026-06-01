import {
  ALLOWED_INQUIRY_STATUSES,
  getInquiryStatusUpdate,
} from "../utils"

describe("seller inquiry utils", () => {
  it("allows the marketplace inquiry statuses", () => {
    expect([...ALLOWED_INQUIRY_STATUSES].sort()).toEqual([
      "archived",
      "new",
      "read",
      "replied",
    ])
  })

  it("adds a reply timestamp only when marking an inquiry replied", () => {
    const now = new Date("2026-06-01T12:00:00.000Z")

    expect(getInquiryStatusUpdate("replied", now)).toEqual({
      status: "replied",
      replied_at: "2026-06-01T12:00:00.000Z",
    })
    expect(getInquiryStatusUpdate("read", now)).toEqual({ status: "read" })
  })
})
