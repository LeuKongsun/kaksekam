import { cleanOptionalText, slugifySellerHandle } from "../utils"

describe("seller profile utils", () => {
  describe("slugifySellerHandle", () => {
    it("normalizes farm names into stable handles", () => {
      expect(slugifySellerHandle("  Green Valley Farm Co.  ")).toBe(
        "green-valley-farm-co"
      )
    })

    it("collapses repeated separators and trims edges", () => {
      expect(slugifySellerHandle("---North & South Produce!!!")).toBe(
        "north-south-produce"
      )
    })
  })

  describe("cleanOptionalText", () => {
    it("returns trimmed text when present", () => {
      expect(cleanOptionalText("  hello@farm.test  ")).toBe("hello@farm.test")
    })

    it("returns null for empty optional values", () => {
      expect(cleanOptionalText("   ")).toBeNull()
      expect(cleanOptionalText()).toBeNull()
    })
  })
})
