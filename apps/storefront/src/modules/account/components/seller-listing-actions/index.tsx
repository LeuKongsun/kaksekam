"use client"

import {
  markSellerListingSold,
  SellerListing,
  withdrawSellerListing,
} from "@lib/data/seller-listings"
import { CheckCircleSolid, PencilSquare, Trash } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import { useRouter } from "next/navigation"
import { ReactNode, useState, useTransition } from "react"

type SellerListingActionsProps = {
  listing: SellerListing
}

const editableStatuses = new Set<SellerListing["status"]>([
  "draft",
  "pending_review",
  "active",
  "rejected",
])

const withdrawableStatuses = new Set<SellerListing["status"]>([
  "draft",
  "pending_review",
  "active",
  "rejected",
])

const SellerListingActions = ({ listing }: SellerListingActionsProps) => {
  const router = useRouter()
  const [withdrawError, setWithdrawError] = useState<string | null>(null)
  const [soldError, setSoldError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isMarkingSold, startSoldTransition] = useTransition()
  const canEdit = editableStatuses.has(listing.status)
  const canWithdraw = withdrawableStatuses.has(listing.status)
  const canMarkSold = listing.status === "active"

  const withdraw = () => {
    setWithdrawError(null)

    startTransition(async () => {
      const result = await withdrawSellerListing(listing.id)

      if (!result.success) {
        setWithdrawError(result.error)
        return
      }

      router.refresh()
    })
  }

  const markSold = () => {
    setSoldError(null)

    startSoldTransition(async () => {
      const result = await markSellerListingSold(listing.id)

      if (!result.success) {
        setSoldError(result.error)
        return
      }

      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-start gap-y-2 small:items-end">
      <div className="flex flex-wrap gap-2 small:justify-end">
        {canEdit ? (
          <LocalizedClientLink
            href={`/account/listings/${listing.id}/edit`}
            className={iconActionClass}
            title="Edit"
            aria-label="Edit listing"
          >
            <PencilSquare />
            <ActionTooltip>Edit</ActionTooltip>
          </LocalizedClientLink>
        ) : (
          <IconAction label="Edit" disabled>
            <PencilSquare />
          </IconAction>
        )}
        <IconAction
          type="button"
          label="Withdraw"
          disabled={!canWithdraw}
          isLoading={isPending}
          onClick={withdraw}
        >
          <Trash />
        </IconAction>
        <IconAction
          type="button"
          label="Mark sold"
          disabled={!canMarkSold}
          isLoading={isMarkingSold}
          onClick={markSold}
        >
          <CheckCircleSolid />
        </IconAction>
      </div>

      {withdrawError && (
        <p className="text-small-regular text-rose-600">{withdrawError}</p>
      )}
      {soldError && (
        <p className="text-small-regular text-rose-600">{soldError}</p>
      )}
    </div>
  )
}

const iconActionClass =
  "group relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-ui-fg-base transition-colors hover:bg-gray-50 hover:text-ui-fg-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-fg-base disabled:pointer-events-none disabled:opacity-40"

const ActionTooltip = ({ children }: { children: ReactNode }) => (
  <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-ui-fg-base px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
    {children}
  </span>
)

const IconAction = ({
  label,
  isLoading,
  children,
  ...props
}: {
  label: string
  isLoading?: boolean
  children: ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={iconActionClass}
    title={label}
    aria-label={label}
    disabled={props.disabled || isLoading}
    {...props}
  >
    {isLoading ? <Spinner size={16} /> : children}
    <ActionTooltip>{label}</ActionTooltip>
  </button>
)

export default SellerListingActions
