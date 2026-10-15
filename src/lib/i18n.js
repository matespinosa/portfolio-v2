import spanish from '../data/translationsEs.json' with { type: 'json' }
import { normalizeLanguage } from '../data/language.js'
import { rappiTranslationsEs } from '../data/rappi.js'

const translations = { ...spanish, ...rappiTranslationsEs }

export function translate(language, text, values = {}) {
  const template = normalizeLanguage(language) === 'es' && Object.hasOwn(translations, text) ? translations[text] : text
  return template.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match)
}

// Translate only catalogued content; ids, URLs, source code and brand names stay stable.
export function localizeContent(language, content) {
  if (typeof content === 'string') return translate(language, content)
  if (Array.isArray(content)) return content.map((item) => localizeContent(language, item))
  if (content && typeof content === 'object') {
    return Object.fromEntries(Object.entries(content).map(([key, value]) => [key, localizeContent(language, value)]))
  }
  return content
}
