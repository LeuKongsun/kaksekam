"use client"

import { useRouter } from "next/navigation"
import { useMemo, useTransition } from "react"
import ReactCountryFlag from "react-country-flag"

import { updateLocale } from "@lib/data/locale-actions"
import { Locale } from "@lib/data/locales"
import { normalizeLocale } from "@lib/i18n/translations"

type LanguageFlagsProps = {
  locales: Locale[] | null
  currentLocale: string | null
}

const flagOptions = [
  { code: "en", countryCode: "GB", fallbackName: "English" },
  { code: "km", countryCode: "KH", fallbackName: "Khmer" },
] as const

const LanguageFlags = ({ locales, currentLocale }: LanguageFlagsProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const activeLocale = normalizeLocale(currentLocale)

  const options = useMemo(() => {
    return flagOptions.map((option) => {
      const locale = locales?.find(
        (item) =>
          normalizeLocale(item.code) === option.code ||
          item.code.toLowerCase() === option.code
      )

      return {
        ...option,
        name: locale?.name ?? option.fallbackName,
      }
    })
  }, [locales])

  const handleChange = (localeCode: string) => {
    startTransition(async () => {
      await updateLocale(localeCode)
      router.refresh()
    })
  }

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1"
      aria-label="Language"
    >
      {options.map((option) => {
        const isActive = activeLocale === option.code

        return (
          <button
            key={option.code}
            type="button"
            onClick={() => handleChange(option.code)}
            disabled={isPending || isActive}
            title={option.name}
            aria-label={option.name}
            aria-pressed={isActive}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              isActive
                ? "bg-gray-100 ring-1 ring-ui-fg-base"
                : "hover:bg-gray-50"
            } disabled:cursor-default`}
          >
            {/* @ts-ignore */}
            <ReactCountryFlag
              svg
              countryCode={option.countryCode}
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "9999px",
              }}
            />
          </button>
        )
      })}
    </div>
  )
}

export default LanguageFlags
