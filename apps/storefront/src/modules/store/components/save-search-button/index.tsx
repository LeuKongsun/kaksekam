"use client"

import { saveSearch } from "@lib/data/saved-searches"
import { useState, useTransition } from "react"

type SaveSearchButtonProps = {
  countryCode: string
  q?: string
  category?: string
  location?: string
}

const SaveSearchButton = ({
  countryCode,
  q,
  category,
  location,
}: SaveSearchButtonProps) => {
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const canSave = !!(q || category || location)

  const onSave = () => {
    setMessage(null)

    startTransition(async () => {
      const result = await saveSearch({
        countryCode,
        query: q,
        category,
        location,
      })

      setMessage(result.success ? "Search saved." : result.error)
    })
  }

  return (
    <div className="flex flex-col items-start gap-y-2 small:items-end">
      <button
        type="button"
        disabled={!canSave || isPending}
        onClick={onSave}
        className="rounded-full border border-gray-300 px-4 py-2 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base disabled:pointer-events-none disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save search"}
      </button>
      {message && (
        <p className="max-w-[220px] text-small-regular text-ui-fg-subtle">
          {message}
        </p>
      )}
    </div>
  )
}

export default SaveSearchButton
