export const PROJECT_ALIASES = {
  modyo: ['modyo', 'modyo platform', 'dxp', 'low code', 'low-code', 'modio'],
  mibanco: ['mibanco', 'mi banco', 'cdt', 'cdts'],
  credicorp: ['credicorp', 'credicorp capital', 'corporate fx'],
  dando: ['dando', 'dando by cfg', 'cfg partners', 'libranza'],
  kapital: ['kapital', 'kapital bank', 'kapital colombia', 'factoring', 'cesionbnk', 'radian'],
}

const ENTITY_ALIASES = {
  ...PROJECT_ALIASES,
  // Common transcriptions of the proper name, including the local speech engine.
  rappi: ['rappi', 'rapi', 'rappy', 'rapy', 'raffi', 'raffy', 'merchants', 'mi tienda', 'portal partners', 'portal aliados'],
}
const NAMES = Object.keys(ENTITY_ALIASES)
const ORDINARY_WORDS = new Set(['modo', 'mando', 'capital'])

export function normalizeQuestion(value) {
  return String(value || '')
    .toLocaleLowerCase('en')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function oneEditApart(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false
  if (a.length === b.length) {
    const differences = [...a].map((letter, index) => letter === b[index] ? -1 : index).filter((index) => index !== -1)
    if (differences.length <= 1) return true
    const [left, right] = differences
    return differences.length === 2 && right === left + 1 && a[left] === b[right] && a[right] === b[left]
  }
  const shorter = a.length < b.length ? a : b
  const longer = a.length < b.length ? b : a
  const index = [...shorter].findIndex((letter, i) => letter !== longer[i])
  return index === -1 || shorter.slice(index) === longer.slice(index + 1)
}

export function resolvePortfolioEntities(question) {
  const normalized = normalizeQuestion(question).replace(/[.\s]+/g, ' ').trim()
  const padded = ` ${normalized} `
  const matches = new Map()
  for (const [id, aliases] of Object.entries(ENTITY_ALIASES)) {
    if (aliases.some((alias) => padded.includes(` ${normalizeQuestion(alias)} `))) matches.set(id, 'exact')
  }
  // Fuzzy matching is restricted to proper names; searching whole project bodies here
  // would turn generic words into confident but unrelated project answers.
  for (const token of normalized.split(' ')) {
    if (token.length < 4 || ORDINARY_WORDS.has(token)) continue
    const candidates = NAMES.filter((name) => oneEditApart(token, name))
    if (candidates.length === 1 && !matches.has(candidates[0])) matches.set(candidates[0], 'fuzzy')
  }
  return [...matches].map(([id, match]) => ({ id, match }))
}

export function mentionedProjectIds(question) {
  return resolvePortfolioEntities(question).map(({ id }) => id)
}
