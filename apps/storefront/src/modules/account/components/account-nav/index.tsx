"use client"

import { ArrowRightOnRectangle } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useParams, usePathname } from "next/navigation"
import type { ComponentType, ReactNode } from "react"

import { signout } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import Eye from "@modules/common/icons/eye"
import MapPin from "@modules/common/icons/map-pin"
import Package from "@modules/common/icons/package"
import User from "@modules/common/icons/user"

const marketplaceLinks = [
  {
    href: "/account/listings",
    label: "Listings",
    testId: "listings-link",
    icon: Package,
  },
  {
    href: "/account/inquiries",
    label: "Messages",
    testId: "inquiries-link",
    icon: MessageIcon,
  },
  {
    href: "/account/seller-profile",
    label: "Seller",
    testId: "seller-profile-link",
    icon: User,
  },
]

const buyerLinks = [
  {
    href: "/account/saved",
    label: "Saved",
    testId: "saved-listings-link",
    icon: Eye,
  },
  {
    href: "/account/buyer-inquiries",
    label: "Sent",
    testId: "buyer-inquiries-link",
    icon: MessageIcon,
  },
]

const mobileShortcutLinks = [
  {
    href: "/account/listings",
    label: "Listings",
    testId: "mobile-listings-link",
    icon: Package,
  },
  {
    href: "/account/inquiries",
    label: "Messages",
    testId: "mobile-inquiries-link",
    icon: MessageIcon,
  },
  {
    href: "/account/saved",
    label: "Saved",
    testId: "mobile-saved-link",
    icon: Eye,
  },
  {
    href: "/account/seller-profile",
    label: "Seller",
    testId: "mobile-seller-profile-link",
    icon: User,
  },
  {
    href: "/account/profile",
    label: "Profile",
    testId: "mobile-profile-link",
    icon: User,
  },
]

const settingsLinks = [
  {
    href: "/account/profile",
    label: "Profile",
    testId: "profile-link",
    icon: User,
  },
  {
    href: "/account/addresses",
    label: "Addresses",
    testId: "addresses-link",
    icon: MapPin,
  },
]

const AccountNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const handleLogout = async () => {
    await signout(countryCode)
  }

  return (
    <div>
      <div className="small:hidden" data-testid="mobile-account-nav">
        {route !== `/${countryCode}/account` ? (
          <LocalizedClientLink
            href="/account/listings"
            className="flex items-center gap-x-2 text-small-regular py-2"
            data-testid="account-main-link"
          >
            <>
              <ChevronDown className="transform rotate-90" />
              <span>Account</span>
            </>
          </LocalizedClientLink>
        ) : (
          <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
            <div>
              <div className="text-large-semi">
                Hello {customer?.first_name}
              </div>
              <p className="mt-1 text-small-regular text-ui-fg-subtle">
                Choose a shortcut.
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {mobileShortcutLinks.map((link) => {
                const Icon = link.icon

                return (
                  <LocalizedClientLink
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-x-2 rounded-md border border-gray-200 px-3 py-3 text-small-semi text-ui-fg-base"
                    data-testid={link.testId}
                  >
                    <Icon size={16} className="text-ui-fg-muted" />
                    {link.label}
                  </LocalizedClientLink>
                )
              })}
            </div>
            <button
              type="button"
              className="mt-3 flex w-full items-center gap-x-2 text-small-regular text-ui-fg-subtle"
              onClick={handleLogout}
              data-testid="logout-button"
            >
              <ArrowRightOnRectangle />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>
      <div className="hidden small:block" data-testid="account-nav">
        <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
          <div className="pb-4">
            <h3 className="text-base-semi">
              {customer?.first_name ? `Hi, ${customer.first_name}` : "Account"}
            </h3>
            <p className="mt-1 text-small-regular text-ui-fg-subtle">
              Manage your market activity
            </p>
          </div>
          <div className="text-base-regular">
            <ul className="flex mb-0 justify-start items-start flex-col gap-y-3">
              {marketplaceLinks.map((link) => (
                <li key={link.href}>
                  <AccountNavLink
                    href={link.href}
                    route={route!}
                    icon={link.icon}
                    data-testid={link.testId}
                  >
                    {link.label}
                  </AccountNavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 border-t border-gray-200 pt-4 text-base-regular">
            <p className="mb-3 text-small-semi uppercase text-ui-fg-muted">
              Buying
            </p>
            <ul className="flex mb-0 justify-start items-start flex-col gap-y-3">
              {buyerLinks.map((link) => (
                <li key={link.href}>
                  <AccountNavLink
                    href={link.href}
                    route={route!}
                    icon={link.icon}
                    data-testid={link.testId}
                  >
                    {link.label}
                  </AccountNavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 border-t border-gray-200 pt-4 text-base-regular">
            <p className="mb-3 text-small-semi uppercase text-ui-fg-muted">
              Settings
            </p>
            <ul className="flex mb-0 justify-start items-start flex-col gap-y-3">
              {settingsLinks.map((link) => (
                <li key={link.href}>
                  <AccountNavLink
                    href={link.href}
                    route={route!}
                    icon={link.icon}
                    data-testid={link.testId}
                  >
                    {link.label}
                  </AccountNavLink>
                </li>
              ))}
              <li className="text-grey-700">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-x-2 text-ui-fg-subtle hover:text-ui-fg-base"
                  data-testid="logout-button"
                >
                  <ArrowRightOnRectangle />
                  <span>Log out</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

type AccountNavLinkProps = {
  href: string
  route: string
  children: ReactNode
  icon?: ComponentType<{ size?: string | number; className?: string }>
  "data-testid"?: string
}

const AccountNavLink = ({
  href,
  route,
  children,
  icon: Icon,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  const { countryCode }: { countryCode: string } = useParams()

  const active = route.split(countryCode)[1] === href
  return (
    <LocalizedClientLink
      href={href}
      className={clx(
        "inline-flex items-center gap-x-2 text-ui-fg-subtle hover:text-ui-fg-base",
        {
          "text-ui-fg-base font-semibold": active,
        }
      )}
      data-testid={dataTestId}
    >
      {Icon && <Icon size={16} className="text-ui-fg-muted" />}
      {children}
    </LocalizedClientLink>
  )
}

function MessageIcon({
  size = 16,
  className,
}: {
  size?: string | number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4.25 5.25C4.25 4.55964 4.80964 4 5.5 4H14.5C15.1904 4 15.75 4.55964 15.75 5.25V11.25C15.75 11.9404 15.1904 12.5 14.5 12.5H9L5.75 15.25V12.5H5.5C4.80964 12.5 4.25 11.9404 4.25 11.25V5.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default AccountNav
