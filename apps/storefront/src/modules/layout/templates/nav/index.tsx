import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { retrieveCustomer } from "@lib/data/customer"
import { listRegions } from "@lib/data/regions"
import { getTranslations } from "@lib/i18n/server"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import LanguageFlags from "@modules/layout/components/language-flags"
import SideMenu from "@modules/layout/components/side-menu"

const navLinkClass =
  "text-ui-fg-base transition-colors hover:text-ui-fg-subtle"

export default async function Nav() {
  const [regions, locales, currentLocale, customer, { t }] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    retrieveCustomer().catch(() => null),
    getTranslations(),
  ])

  const primaryLinks = customer
    ? [
        {
          label: t.common.saved,
          href: "/account/saved",
          testId: "nav-saved-link",
        },
        {
          label: t.common.messages,
          href: "/account/inquiries",
          testId: "nav-messages-link",
        },
      ]
    : []

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-[4.25rem] mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="mx-auto flex h-full w-full max-w-[1120px] items-center gap-4 px-4 text-base-regular text-ui-fg-subtle small:gap-6 small:px-6 min-[1168px]:px-0">
          <div className="flex min-w-0 items-center gap-3 small:gap-5">
            <div className="small:hidden">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
                customer={customer}
                labels={{
                  browse: t.common.browse,
                  myListings: t.common.myListings,
                  messages: t.common.messages,
                  saved: t.common.saved,
                  account: t.common.account,
                  signIn: t.common.signIn,
                  sell: t.common.sell,
                  menu: t.common.menu,
                  language: t.common.language,
                  defaultLanguage: t.common.defaultLanguage,
                  brand: t.common.brand,
                }}
              />
            </div>
            <LocalizedClientLink
              href="/"
              className="min-w-0 truncate text-small-semi tracking-normal text-brand hover:text-brand-hover small:text-base-semi"
              data-testid="nav-store-link"
            >
              {t.common.brand}
            </LocalizedClientLink>
            <div className="hidden items-center gap-x-6 small:flex">
              {primaryLinks.map((link) => (
                <LocalizedClientLink
                  key={link.href}
                  className={navLinkClass}
                  href={link.href}
                  data-testid={link.testId}
                >
                  {link.label}
                </LocalizedClientLink>
              ))}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-x-2 small:gap-x-3">
            <LocalizedClientLink
              className="rounded-full bg-brand px-4 py-2 text-small-semi text-white transition-colors hover:bg-brand-hover small:px-5 small:py-2.5"
              href="/account/listings"
              data-testid="nav-sell-link"
            >
              {t.common.sell}
            </LocalizedClientLink>
            <LocalizedClientLink
              className="hidden rounded-full border border-gray-200 px-4 py-2 text-small-semi text-ui-fg-base transition-colors hover:border-gray-400 small:inline-flex small:px-5 small:py-2.5"
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
