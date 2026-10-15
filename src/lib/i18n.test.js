import assert from 'node:assert/strict'
import test from 'node:test'
import baseSpanish from '../data/translationsEs.json' with { type: 'json' }
import { rappiTranslationsEs } from '../data/rappi.js'
import { projects, experience, selectedClients } from '../data/projects.js'
import { profile } from '../data/profile.js'
import { LANGUAGE_STORAGE_KEY, localeFor, readLanguage } from '../data/language.js'
import { localizeContent, translate } from './i18n.js'

const spanish = { ...baseSpanish, ...rappiTranslationsEs }

test('keeps the selected language and handles unavailable or invalid storage', () => {
  assert.equal(readLanguage({ getItem: (key) => key === LANGUAGE_STORAGE_KEY ? 'es' : null }), 'es')
  assert.equal(readLanguage({ getItem: () => 'fr' }), 'en')
  assert.equal(readLanguage({ getItem: () => { throw new Error('blocked') } }), 'en')
  assert.equal(readLanguage(null), 'en')
  assert.equal(localeFor('es'), 'es-CO')
  assert.equal(localeFor('en'), 'en-US')
})

test('translates templates without changing inserted names or visitor content', () => {
  assert.equal(translate('es', 'Project cover: {title}', { title: 'Modyo Platform' }), 'Portada del proyecto: Modyo Platform')
  assert.equal(translate('en', 'No command matches “{query}”', { query: '¿Hola?' }), 'No command matches “¿Hola?”')
  for (const [key, value] of Object.entries(spanish)) {
    assert.ok(value.trim(), key)
    assert.deepEqual([...key.matchAll(/\{\w+\}/g)].map(([token]) => token).sort(), [...value.matchAll(/\{\w+\}/g)].map(([token]) => token).sort(), key)
  }
})

test('covers every descriptive field of the six cases, career and profile', () => {
  const fields = new Set(['title', 'name', 'category', 'role', 'scope', 'team', 'duration', 'intro', 'body', 'bullets', 'label', 'detail', 'alt', 'outcomes', 'metricsNote', 'outcomesLabel', 'summary', 'context', 'span', 'tenure', 'design', 'frontend', 'aiPractice', 'processSummary', 'metricsSource', 'screensNote'])
  const missing = []
  function check(value, key) {
    if (typeof value === 'string' && fields.has(key) && /[a-zA-Z]/.test(value)) {
      if (!Object.hasOwn(spanish, value)) missing.push(value)
    } else if (Array.isArray(value)) value.forEach((item) => check(item, key))
    else if (value && typeof value === 'object') Object.entries(value).forEach(([field, item]) => check(item, field))
  }
  check({ projects, experience, selectedClients, profile })
  assert.deepEqual(missing, [])
  for (const project of projects) {
    const localized = localizeContent('es', project)
    assert.equal(localized.id, project.id)
    assert.equal(localized.heroImage, project.heroImage)
    assert.deepEqual(localized.gallery.map((image) => image.src), project.gallery.map((image) => image.src))
    assert.equal(localized.sections.length, project.sections.length)
    assert.deepEqual(localizeContent('en', project), project)
  }
})
