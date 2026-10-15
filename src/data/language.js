export const PORTFOLIO_LANGUAGE = 'en'
export const PORTFOLIO_LOCALE = 'en-US'

export const LANGUAGE_STORAGE_KEY = 'portfolio-language'
export const SUPPORTED_LANGUAGES = ['en', 'es']

export function normalizeLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language) ? language : PORTFOLIO_LANGUAGE
}

export function localeFor(language) {
  return normalizeLanguage(language) === 'es' ? 'es-CO' : PORTFOLIO_LOCALE
}

export function readLanguage(storage) {
  try {
    return normalizeLanguage((storage === undefined ? globalThis.localStorage : storage)?.getItem(LANGUAGE_STORAGE_KEY))
  } catch {
    return PORTFOLIO_LANGUAGE
  }
}
