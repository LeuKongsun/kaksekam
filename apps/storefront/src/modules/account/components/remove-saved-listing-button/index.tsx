"use client"

import { removeSavedListing } from "@lib/data/saved-listings"
import { Trash } from "@medusajs/icons"
import { Button } from "@modules/common/components/ui"
import Spinner from "@modules/common/icons/spinner"
import { useParams, useRouter } from "next/navigation"
import { ReactNode, useState, useTransition } from "react"

type RemoveSavedListingButtonProps = {
  savedListingId: string
  variant?: "text" | "icon"
}

const RemoveSavedListingButton = ({
  savedListingId,
  variant = "text",
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
      {variant === "icon" ? (
        <button
          type="button"
          className={iconActionClass}
          title="Remove"
          aria-label="Remove saved listing"
          disabled={isPending}
          onClick={remove}
        >
          {isPending ? <Spinner size={16} /> : <Trash />}
          <ActionTooltip>Remove</ActionTooltip>
        </button>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="small"
          isLoading={isPending}
          onClick={remove}
        >
          Remove
        </Button>
      )}
      {error && <span className="text-small-regular text-rose-600">{error}</span>}
    </div>
  )
}

const iconActionClass =
  "group relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-ui-fg-base transition-colors hover:bg-gray-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-fg-base disabled:pointer-events-none disabled:opacity-40"

const ActionTooltip = ({ children }: { children: ReactNode }) => (
  <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-ui-fg-base px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
    {children}
  </span>
)

export default RemoveSavedListingButton
