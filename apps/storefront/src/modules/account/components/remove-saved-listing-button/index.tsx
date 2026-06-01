"use client"

import { removeSavedListing } from "@lib/data/saved-listings"
import { Button } from "@modules/common/components/ui"
import { useParams, useRouter } from "next/navigation"
import { useState, useTransition } from "react"

type RemoveSavedListingButtonProps = {
  savedListingId: string
}

const RemoveSavedListingButton = ({
  savedListingId,
}: RemoveSavedListingButtonProps) => {
  const { countryCode } = useParams() as { countryCode: string }
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const remove = () => {
    setError(null)

    startTransition(async () => {
      const result = await removeSavedListing(savedListingId, countryCode)

      if (!result.success) {
        setError(result.error)
        return
      }

      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-start gap-y-2 small:items-end">
      <Button
        type="button"
        variant="secondary"
        size="small"
        isLoading={isPending}
        onClick={remove}
      >
        Remove
      </Button>
      {error && <span className="text-small-regular text-rose-600">{error}</span>}
    </div>
  )
}

export default RemoveSavedListingButton
