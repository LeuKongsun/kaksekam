"use client"

import {
  removeSavedListing,
  saveListing,
  SavedListing,
} from "@lib/data/saved-listings"
import { Button } from "@modules/common/components/ui"
import { useParams } from "next/navigation"
import { useState, useTransition } from "react"

type SaveListingButtonProps = {
  productId: string
  savedListing: SavedListing | null
}

const SaveListingButton = ({
  productId,
  savedListing,
}: SaveListingButtonProps) => {
  const { countryCode } = useParams() as { countryCode: string }
  const [currentSavedListing, setCurrentSavedListing] = useState(savedListing)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const toggleSaved = () => {
    setError(null)

    startTransition(async () => {
      if (currentSavedListing) {
        const result = await removeSavedListing(currentSavedListing.id, countryCode)

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
