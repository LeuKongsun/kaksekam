"use client"

import {
  removeSavedListing,
  saveListing,
  SavedListing,
} from "@lib/data/saved-listings"
import { Heart } from "@medusajs/icons"
import { Button } from "@modules/common/components/ui"
import { useParams } from "next/navigation"
import { useState, useTransition } from "react"

type SaveListingButtonProps = {
  productId: string
  savedListing: SavedListing | null
  variant?: "button" | "icon"
}

const SaveListingButton = ({
  productId,
  savedListing,
  variant = "button",
}: SaveListingButtonProps) => {
  const { countryCode } = useParams() as { countryCode: string }
  const [currentSavedListing, setCurrentSavedListing] = useState(savedListing)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const toggleSaved = () => {
    setError(null)

    startTransition(async () => {
      if (currentSavedListing) {
        const result = await removeSavedListing(
          currentSavedListing.id,
          countryCode,
        )

        if (!result.success) {
          setError(result.error)
          return
        }

        setCurrentSavedListing(null)
        return
      }

      const result = await saveListing(productId, countryCode)

      if (!result.success) {
        setError(result.error)
        return
      }

      setCurrentSavedListing(result.savedListing)
    })
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        aria-label={
          currentSavedListing ? "Remove saved product" : "Save product"
        }
        title={error ?? (currentSavedListing ? "Saved" : "Save")}
        disabled={isPending}
        onClick={toggleSaved}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
          currentSavedListing
            ? "border-ui-fg-base bg-ui-fg-base text-white hover:bg-ui-fg-subtle"
            : "border-gray-200 bg-white/95 text-ui-fg-base hover:bg-gray-50"
        } ${error ? "text-rose-600" : ""}`}
        data-testid="save-listing-button"
      >
        <Heart width={16} height={16} />
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-y-2">
      <Button
        type="button"
        variant="secondary"
        className="h-10 w-full"
        isLoading={isPending}
        onClick={toggleSaved}
        data-testid="save-listing-button"
      >
        {currentSavedListing ? "Saved" : "Save listing"}
      </Button>
      {error && <p className="text-small-regular text-rose-600">{error}</p>}
    </div>
  )
}

export default SaveListingButton
