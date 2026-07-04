import {
  cleanOptionalText,
  getDefaultSavedSearchName,
  productMatchesSavedSearch,
} from "../utils"

describe("saved search utils", () => {
  it("builds a readable default name from active filters", () => {
    expect(
      getDefaultSavedSearchName({
        query: "rice",
        category: "Produce",
        location: "Takeo",
      })
    ).toBe("rice / Produce / Takeo")
  })

  it("cleans optional text inputs", () => {
    expect(cleanOptionalText("  Produce  ")).toBe("Produce")
    expect(cleanOptionalText("   ")).toBeNull()
  })

  it("matches active listings by query, category, and location", () => {
    expect(
      productMatchesSavedSearch(
        {
          title: "Jasmine rice",
          description: "Fresh harvest",
          listing: {
            status: "active",
            category: "Produce",
            location: "Takeo Province",
          },
        },
        {
          query: "rice",
          category: "produce",
          location: "takeo",
        }
      )
    ).toBe(true)
  })

  it("matches active listings by condition", () => {
    expect(
      productMatchesSavedSearch(
        {
          title: "Jasmine rice",
          listing: {
            status: "active",
            category: "Produce",
            location: "Takeo Province",
            condition: "Organic",
          },
        },
        {
          condition: "organic",
        }
      )
    ).toBe(true)
  })

  it("does not match inactive listings", () => {
    expect(
      productMatchesSavedSearch(
        {
          title: "Jasmine rice",
          listing: {
            status: "pending_review",
            category: "Produce",
            location: "Takeo",
          },
        },
        { query: "rice" }
      )
    ).toBe(false)
  })
})
