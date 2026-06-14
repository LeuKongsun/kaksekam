import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { retrieveCustomer } from "@lib/data/customer"
import { listRegions } from "@lib/data/regions"
import { getTranslations } from "@lib/i18n/server"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import LanguageFlags from "@modules/layout/components/language-flags"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const [regions, locales, currentLocale, customer, { t }] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    retrieveCustomer().catch(() => null),
    getTranslations(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="mx-auto flex h-full w-full max-w-[1120px] items-center justify-between px-4 text-small-regular text-ui-fg-subtle small:px-6 min-[1168px]:px-0">
          <div className="flex flex-1 basis-0 items-center gap-3 h-full small:gap-5">
            <div className="h-full small:hidden">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
                labels={{
                  browse: t.common.browse,
                  sell: t.common.sell,
                  account: t.common.account,
                  menu: t.common.menu,
                  language: t.common.language,
                  defaultLanguage: t.common.defaultLanguage,
                  brand: t.common.brand,
                }}
              />
            </div>
            <LocalizedClientLink
              href="/"
              className="text-small-semi tracking-normal text-[#ff385c] hover:text-[#e83152] small:text-base-semi"
              data-testid="nav-store-link"
            >
              {t.common.brand}
            </LocalizedClientLink>
          </div>

          <div className="hidden items-center gap-x-8 h-full small:flex">
            <LocalizedClientLink
              className="text-ui-fg-base hover:text-ui-fg-subtle"
              href="/store"
              data-testid="nav-listings-link"
            >
              {t.common.listings}
            </LocalizedClientLink>
            <LocalizedClientLink
              className="hover:text-ui-fg-base"
              href="/account/listings"
              data-testid="nav-post-link"
            >
              {t.common.myListings}
            </LocalizedClientLink>
            <LocalizedClientLink
              className="hover:text-ui-fg-base"
              href="/account/inquiries"
            >
              {t.common.inquiries}
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-2 h-full flex-1 basis-0 justify-end small:gap-x-3">
            <LocalizedClientLink
              className="rounded-full border border-gray-200 px-3 py-1.5 text-ui-fg-base transition-colors hover:border-gray-400 small:px-4 small:py-2"
              href="/account/listings"
              data-testid="nav-sell-link"
            >
              {t.common.sell}
            </LocalizedClientLink>
            <LocalizedClientLink
              className="rounded-full border border-gray-200 px-3 py-1.5 text-ui-fg-base transition-colors hover:border-gray-400 small:px-4 small:py-2"
              href="/account"
              data-testid="nav-account-link"
            >
              {customer ? t.common.account : t.common.signIn}
            </LocalizedClientLink>
            <LanguageFlags locales={locales} currentLocale={currentLocale} />
          </div>
        </nav>
      </header>
    </div>
  )
}
