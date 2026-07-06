import { suwannaphum } from "@lib/fonts"
import { getBaseURL } from "@lib/util/env"
import { getTranslations } from "@lib/i18n/server"
import { TranslationProvider } from "@lib/i18n/context"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { locale } = await getTranslations()

  return (
    <html
      lang={locale}
      data-mode="light"
      className={suwannaphum.variable}
      suppressHydrationWarning
    >
      <body>
        <TranslationProvider locale={locale}>
          <main className="relative">{props.children}</main>
        </TranslationProvider>
      </body>
    </html>
  )
}
