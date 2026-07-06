"use client"

import React, { createContext, useContext } from "react"
import { translations, SupportedLocale } from "./translations"

type TranslationContextType = {
  locale: SupportedLocale
  t: typeof translations.en
}

const TranslationContext = createContext<TranslationContextType | null>(null)

export const TranslationProvider = ({
  locale,
  children,
}: {
  locale: SupportedLocale
  children: React.ReactNode
}) => {
  const t = translations[locale] as unknown as typeof translations.en

  return (
    <TranslationContext.Provider value={{ locale, t }}>
      {children}
    </TranslationContext.Provider>
  )
}

export const useTranslation = () => {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}
