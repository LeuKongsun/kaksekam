"use client"

const ProductTabs = () => {
  return (
    <div className="flex w-full flex-col gap-4">
      <BuyerSafetyTips />
    </div>
  )
}

const BuyerSafetyTips = () => {
  const tips = [
    "Meet the seller in a public or familiar place whenever possible.",
    "Inspect the product carefully before agreeing to buy or pay.",
    "Use comments or inquiry to confirm condition, pickup details, and timing.",
    "Avoid sending money before you are comfortable with the seller and listing.",
    "Keep a record of messages, agreed price, pickup time, and seller contact details.",
  ]

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-small-regular">
      <div className="flex items-center gap-2 text-amber-800">
        <AlertIcon />
        <h3 className="text-base-semi">Safety Tips for Buyers</h3>
      </div>
      <ol className="mt-4 list-decimal space-y-3 pl-5 text-ui-fg-subtle">
        {tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ol>
    </div>
  )
}

const AlertIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 3.25 18 16H2L10 3.25Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M10 7.5v4M10 14.25h.01"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

export default ProductTabs
