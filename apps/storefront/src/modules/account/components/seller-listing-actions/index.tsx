"use client"

import {
  markSellerListingSold,
  SellerListing,
  withdrawSellerListing,
} from "@lib/data/seller-listings"
import { CheckCircleSolid, Trash } from "@medusajs/icons"
import Spinner from "@modules/common/icons/spinner"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect, useRef, useState, useTransition } from "react"
import { createPortal } from "react-dom"

type SellerListingActionsProps = {
  listing: SellerListing
  onViewDetails: () => void
}

const withdrawableStatuses = new Set<SellerListing["status"]>([
  "draft",
  "pending_review",
  "active",
  "rejected",
])

const SellerListingActions = ({
  listing,
  onViewDetails,
}: SellerListingActionsProps) => {
  const router = useRouter()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const [withdrawError, setWithdrawError] = useState<string | null>(null)
  const [soldError, setSoldError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isMarkingSold, startSoldTransition] = useTransition()
  const canWithdraw = withdrawableStatuses.has(listing.status)
  const canMarkSold = listing.status === "active"

  const updateMenuPosition = () => {
    const buttonRect = buttonRef.current?.getBoundingClientRect()

    if (!buttonRect) {
      return
    }

    setMenuPosition({
      top: buttonRect.bottom + 6,
      right: window.innerWidth - buttonRect.right,
    })
  }

  const toggleMenu = () => {
    if (isOpen) {
      setIsOpen(false)
      return
    }

    updateMenuPosition()
    setIsOpen(true)
  }

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node

      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return
      }

      setIsOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    updateMenuPosition()
    window.addEventListener("resize", updateMenuPosition)
    window.addEventListener("scroll", updateMenuPosition, true)
    window.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("resize", updateMenuPosition)
      window.removeEventListener("scroll", updateMenuPosition, true)
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const withdraw = () => {
    setWithdrawError(null)

    startTransition(async () => {
      const result = await withdrawSellerListing(listing.id)

      if (!result.success) {
        setWithdrawError(result.error)
        return
      }

      router.refresh()
      setIsOpen(false)
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
      setIsOpen(false)
    })
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        className={iconActionClass}
        title="More"
        aria-label="More listing actions"
        aria-expanded={isOpen}
        onClick={toggleMenu}
      >
        <OptionsIcon />
        <ActionTooltip>More</ActionTooltip>
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[100] w-44 origin-top-right overflow-hidden rounded-md border border-gray-200 bg-white py-1 text-left opacity-100 shadow-lg ring-1 ring-black/5 transition duration-150 ease-out"
            style={{
              top: menuPosition.top,
              right: menuPosition.right,
            }}
          >
            <MenuButton
              label="Details"
              onClick={() => {
                onViewDetails()
                setIsOpen(false)
              }}
            />
            <MenuButton
              label="Withdraw"
              disabled={!canWithdraw || isPending}
              onClick={withdraw}
              icon={isPending ? <Spinner size={16} /> : <Trash />}
            />
            <MenuButton
              label="Mark sold"
              disabled={!canMarkSold || isMarkingSold}
              onClick={markSold}
              icon={
                isMarkingSold ? <Spinner size={16} /> : <CheckCircleSolid />
              }
            />
            {(withdrawError || soldError) && (
              <div className="border-t border-gray-200 px-3 py-2 text-small-regular text-rose-600">
                {withdrawError || soldError}
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  )
}

const MenuButton = ({
  label,
  icon,
  ...props
}: {
  label: string
  icon?: ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    className="flex w-full items-center gap-2 px-3 py-2 text-small-regular text-ui-fg-base transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
    {...props}
  >
    {icon && (
      <span className="flex h-4 w-4 items-center justify-center">{icon}</span>
    )}
    <span>{label}</span>
  </button>
)

function OptionsIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {[4, 8, 12].map((cx) => (
        <circle
          key={cx}
          cx={cx}
          cy="8"
          r="1.25"
          fill="currentColor"
        />
      ))}
    </svg>
  )
}

const iconActionClass =
  "group relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-ui-fg-base transition-colors hover:bg-gray-50 hover:text-ui-fg-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-fg-base disabled:pointer-events-none disabled:opacity-40"

const ActionTooltip = ({ children }: { children: ReactNode }) => (
  <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-ui-fg-base px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
    {children}
  </span>
)

export default SellerListingActions
