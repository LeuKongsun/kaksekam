"use client"

import { useTranslation } from "@lib/i18n/context"
import { useEffect, useState } from "react"

type ListingShareActionsProps = {
  title: string
  priceText?: string | null
  locationText?: string | null
}

const ListingShareActions = ({
  title,
  priceText,
  locationText,
}: ListingShareActionsProps) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    setShareUrl(window.location.href)
  }, [])

  const shareText = [title, priceText, locationText, t.product.shareCaption]
    .filter(Boolean)
    .join(" · ")

  const getShareData = () => ({
    title,
    text: shareText,
    url: shareUrl,
  })

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const shareNative = async () => {
    if (navigator.share) {
      await navigator.share(getShareData())
      return
    }

    await copyLink()
  }

  return (
    <section
      className="rounded-md border border-gray-200 bg-[#fbfbf7] p-4"
      aria-labelledby="share-listing-title"
    >
      <div className="flex flex-col gap-3 small:flex-row small:items-center small:justify-between">
        <div>
          <h2 id="share-listing-title" className="text-small-semi text-ui-fg-base">
            {t.product.shareListing}
          </h2>
          <p className="mt-1 text-xsmall-regular text-ui-fg-subtle">
            {t.product.shareHelp}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void shareNative()} className={shareButtonClass}>
            {t.product.share}
          </button>
          <a
            className={shareButtonClass}
            href={`https://t.me/share/url?url=${encodeURIComponent(
              shareUrl
            )}&text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noreferrer"
          >
            Telegram
          </a>
          <a
            className={shareButtonClass}
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              shareUrl
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            Facebook
          </a>
          <button type="button" onClick={() => void copyLink()} className={shareButtonClass}>
            {copied ? t.product.copied : t.product.copyLink}
          </button>
        </div>
      </div>
    </section>
  )
}

const shareButtonClass =
  "inline-flex h-9 items-center justify-center rounded-md border border-gray-300 bg-white px-3 text-small-semi text-ui-fg-base transition-colors hover:border-gray-500 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"

export default ListingShareActions
