"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import { Fragment } from "react"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { Locale } from "@lib/data/locales"

type SideMenuLabels = {
  browse: string
  myListings: string
  messages: string
  saved: string
  account: string
  signIn: string
  sell: string
  menu: string
  language: string
  defaultLanguage: string
  brand: string
}

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
  customer: HttpTypes.StoreCustomer | null
  labels: SideMenuLabels
}

const SideMenu = ({
  regions,
  locales,
  currentLocale,
  customer,
  labels,
}: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()
  const menuItems = [
    ...(customer
      ? [
          {
            label: labels.myListings,
            href: "/account/listings",
            testId: "my-listings-link",
          },
          {
            label: labels.messages,
            href: "/account/inquiries",
            testId: "messages-link",
          },
          { label: labels.saved, href: "/account/saved", testId: "saved-link" },
        ]
      : []),
    {
      label: customer ? labels.account : labels.signIn,
      href: "/account",
      testId: "account-link",
    },
  ]

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  aria-label={labels.menu}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full text-ui-fg-base transition-colors duration-200 ease-out hover:bg-gray-100 hover:text-ui-fg-subtle focus:outline-none"
                >
                  <MenuIcon />
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-black/40"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in duration-150"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <PopoverPanel className="fixed inset-y-0 left-0 z-[51] flex w-[320px] max-w-[88vw] flex-col bg-white text-ui-fg-base shadow-xl">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex h-full flex-col"
                  >
                    <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                      <LocalizedClientLink
                        href="/"
                        className="text-base-semi text-brand"
                        onClick={close}
                      >
                        {labels.brand}
                      </LocalizedClientLink>
                      <button
                        data-testid="close-menu-button"
                        onClick={close}
                        aria-label="Close menu"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-ui-fg-subtle transition-colors hover:bg-gray-100 hover:text-ui-fg-base"
                      >
                        <XMark />
                      </button>
                    </div>

                    <div className="border-b border-gray-200 px-5 py-4">
                      <LocalizedClientLink
                        href="/account/listings"
                        className="inline-flex h-10 w-full items-center justify-center rounded-full bg-brand px-4 text-small-semi text-white transition-colors hover:bg-brand-hover"
                        onClick={close}
                        data-testid="mobile-sell-link"
                      >
                        {labels.sell}
                      </LocalizedClientLink>
                    </div>

                    <ul className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
                      {menuItems.map(({ label, href, testId }) => {
                        return (
                          <li key={href}>
                            <LocalizedClientLink
                              href={href}
                              className="block rounded-md px-3 py-3 text-base-semi text-ui-fg-base transition-colors hover:bg-gray-50"
                              onClick={close}
                              data-testid={testId}
                            >
                              {label}
                            </LocalizedClientLink>
                          </li>
                        )
                      })}
                    </ul>

                    <div className="flex flex-col gap-y-5 border-t border-gray-200 px-5 py-5 text-small-regular">
                      {!!locales?.length && (
                        <div
                          className="flex justify-between"
                          onMouseEnter={languageToggleState.open}
                          onMouseLeave={languageToggleState.close}
                        >
                          <LanguageSelect
                            toggleState={languageToggleState}
                            locales={locales}
                            currentLocale={currentLocale}
                            labels={{
                              language: labels.language,
                              defaultLanguage: labels.defaultLanguage,
                            }}
                          />
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150",
                              languageToggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </div>
                      )}
                      <div
                        className="flex justify-between"
                        onMouseEnter={countryToggleState.open}
                        onMouseLeave={countryToggleState.close}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={countryToggleState}
                            regions={regions}
                          />
                        )}
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150",
                            countryToggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                      <Text className="txt-compact-small text-ui-fg-muted">
                        © {new Date().getFullYear()} {labels.brand}.
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

const MenuIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </svg>
)

export default SideMenu
