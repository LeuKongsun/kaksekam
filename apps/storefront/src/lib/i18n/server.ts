import { getLocale } from "@lib/data/locale-actions"
import { normalizeLocale, translations } from "./translations"

export const getTranslations = async () => {
  const locale = normalizeLocale(await getLocale())

  return {
    locale,
    t: translations[locale],
  }
}
