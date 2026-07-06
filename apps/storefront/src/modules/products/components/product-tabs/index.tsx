"use client"

import { useTranslation } from "@lib/i18n/context"

const ProductTabs = () => {
  return (
    <div className="flex w-full flex-col gap-4">
      <BuyerSafetyTips />
    </div>
  )
}

const BuyerSafetyTips = () => {
  const { t } = useTranslation()
  const tips = t.product.safetyTips

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-small-regular">
      <div className="flex items-center gap-2 text-amber-800">
        <AlertIcon />
        <h3 className="text-base-semi">{t.product.safetyTipsTitle}</h3>
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
