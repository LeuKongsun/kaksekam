"use client"

import { Share } from "@medusajs/icons"
import { useParams } from "next/navigation"
import { useState } from "react"

type ShareListingButtonProps = {
  productHandle: string
  productTitle: string
}

const ShareListingButton = ({
  productHandle,
  productTitle,
}: ShareListingButtonProps) => {
  const { countryCode } = useParams() as { countryCode?: string }
  const [copied, setCopied] = useState(false)

  const productPath = `/${countryCode ?? ""}/products/${productHandle}`.replace(
    /\/+/g,
    "/",
  )

  const shareListing = async () => {
    const url = `${window.location.origin}${productPath}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: productTitle,
          url,
        })
        return
      }

      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      aria-label="Share product"
      title={copied ? "Link copied" : "Share"}
      onClick={shareListing}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white/95 text-ui-fg-base shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2"
      data-testid="share-listing-button"
    >
      <Share size={16} />
    </button>
  )
}

export default ShareListingButton
