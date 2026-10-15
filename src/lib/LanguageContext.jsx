import { useEffect, useMemo, useState } from 'react'
import { LanguageContext } from './useLanguage.js'
import { LANGUAGE_STORAGE_KEY, localeFor, normalizeLanguage, readLanguage } from '../data/language.js'
import { translate } from './i18n.js'

export function LanguageProvider({ children }) {
  const [language, updateLanguage] = useState(() => readLanguage())
  const value = useMemo(() => ({
    language,
    locale: localeFor(language),
    t: (text, values) => translate(language, text, values),
    setLanguage: (next) => {
      const normalized = normalizeLanguage(next)
      try { localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized) } catch { /* Storage is optional. */ }
      updateLanguage(normalized)
    },
  }), [language])

  useEffect(() => {
    document.documentElement.lang = language
    const title = value.t('Mateo Espinosa — Product Designer & Frontend')
    const description = value.t('Product designer with frontend experience. Financial products, merchant platforms, design systems and AI-enabled workflows. Based in Bogotá, working across Latin America.')
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
  }, [language, value])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
