import { Text } from "@modules/common/components/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getTranslations } from "@lib/i18n/server"

export default async function Footer() {
  const { t } = await getTranslations()
  const trustSignals = t.footer.trustSignals
  const footerLinks = [
    [t.footer.browseListings, "/store"],
    [t.footer.postListing, "/account/listings"],
    [t.common.account, "/account"],
    [t.common.inquiries, "/account/inquiries"],
  ]

  return (
    <footer className="w-full border-t border-ui-border-base bg-white">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col px-6 min-[1168px]:px-0">
        <div className="grid gap-8 py-10 small:grid-cols-[minmax(0,1fr)_auto] small:items-start small:py-14">
          <div className="max-w-lg">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-[#ff385c] transition-colors hover:text-[#e83152]"
            >
              {t.common.brand}
            </LocalizedClientLink>
            <p className="mt-3 max-w-md text-small-regular text-ui-fg-subtle">
              {t.footer.description}
            </p>
            <p className="mt-5 text-small-regular text-ui-fg-muted">
              {trustSignals.join(" · ")}
            </p>
          </div>

          <nav
            className="flex flex-wrap gap-x-5 gap-y-2 text-small-regular text-ui-fg-subtle small:max-w-xs small:justify-end"
            aria-label="Footer"
          >
            {footerLinks.map(([label, href]) => (
              <LocalizedClientLink
                key={href}
                className="transition-colors hover:text-ui-fg-base"
                href={href}
                data-testid={
                  href === "/store" ? "footer-browse-link" : undefined
                }
              >
                {label}
              </LocalizedClientLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-ui-border-base py-6 text-ui-fg-muted">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} {t.common.brand}.{" "}
            {t.common.allRightsReserved}
          </Text>
        </div>
      </div>
    </footer>
  )
}
