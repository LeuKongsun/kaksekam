import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { retrieveCustomer } from "@lib/data/customer"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const [regions, locales, currentLocale, customer] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    retrieveCustomer().catch(() => null),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex flex-1 basis-0 items-center gap-5 h-full">
            <div className="h-full small:hidden">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>
            <LocalizedClientLink
              href="/"
              className="text-base-semi tracking-normal text-[#ff385c] hover:text-[#e83152]"
              data-testid="nav-store-link"
            >
              Farm Marketplace
            </LocalizedClientLink>
          </div>

          <div className="hidden items-center gap-x-8 h-full small:flex">
            <LocalizedClientLink
              className="text-ui-fg-base hover:text-ui-fg-subtle"
              href="/store"
              data-testid="nav-listings-link"
            >
              Browse
            </LocalizedClientLink>
            <LocalizedClientLink
              className="hover:text-ui-fg-base"
              href="/account/listings"
              data-testid="nav-post-link"
            >
              Sell
            </LocalizedClientLink>
            <LocalizedClientLink
              className="hover:text-ui-fg-base"
              href="/account/inquiries"
            >
              Messages
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <LocalizedClientLink
              className="rounded-full border border-gray-200 px-4 py-2 text-ui-fg-base transition-colors hover:border-gray-400"
              href="/account"
              data-testid="nav-account-link"
            >
              {customer ? "Account" : "Sign in"}
            </LocalizedClientLink>
          </div>
        </nav>
      </header>
    </div>
  )
}
