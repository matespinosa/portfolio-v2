const METRIC_TERMS = [
  'metric',
  'metrics',
  'kpi',
  'result',
  'results',
  'outcome',
  'outcomes',
  'impact',
  'revenue',
  'success',
  'métrica',
  'métricas',
  'resultado',
  'resultados',
  'impacto',
  'ingresos',
  'éxito',
  'logro',
  'logros',
]

const PROCESS_TERMS = [
  'process',
  'method',
  'research',
  'discovery',
  'validation',
  'design system',
  'how did',
  'how was',
  'proceso',
  'metodología',
  'metodologia',
  'investigación',
  'investigacion',
  'descubrimiento',
  'validación',
  'validacion',
  'sistema de diseño',
  'cómo fue',
  'como fue',
  'cómo hizo',
  'como hizo',
]

const ROLE_TERMS = [
  'role',
  'responsibility',
  'responsibilities',
  'team',
  'collaboration',
  'ownership',
  'rol',
  'responsabilidad',
  'responsabilidades',
  'equipo',
  'colaboración',
  'colaboracion',
  'lideró',
  'lidero',
]

const PROFILE_TERMS = {
  current: ['current role', 'currently', 'now', 'rappi', 'rol actual', 'actualmente', 'ahora'],
  frontend: ['frontend', 'front end', 'react', 'next.js', 'nextjs', 'html', 'css', 'javascript'],
  ai: ['artificial intelligence', 'ai practice', 'cursor', 'codex', 'claude', 'inteligencia artificial', 'ia'],
  experience: [
    'experience',
    'background',
    'career',
    'trajectory',
    'employment',
    'history',
    'roles',
    'experiencia',
    'trayectoria',
    'carrera',
    'historial',
    'cargos',
  ],
  location: ['location', 'based', 'located', 'ubicado', 'vive', 'ciudad'],
  practice: [
    'skills',
    'capabilities',
    'practice',
    'strategy',
    'habilidades',
    'capacidades',
    'práctica',
    'practica',
    'estrategia',
  ],
}

function normalize(value) {
  return String(value || '')
    .toLocaleLowerCase('en')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function includesTerm(normalized, terms) {
  const tokens = new Set(normalized.split(' ').filter(Boolean))
  return terms.some((term) => {
    const normalizedTerm = normalize(term)
    return normalizedTerm.includes(' ')
      ? normalized.includes(normalizedTerm)
      : tokens.has(normalizedTerm)
  })
}

function profileTopic(normalized) {
  return Object.entries(PROFILE_TERMS).find(([, terms]) => includesTerm(normalized, terms))?.[0]
}

const FOLLOW_UP_REFERENCES = [
  'it',
  'its',
  'that project',
  'this project',
  'these projects',
  'those projects',
  'them',
  'their',
  'este proyecto',
  'esta experiencia',
  'estos proyectos',
  'estas experiencias',
  'ese proyecto',
  'esos proyectos',
  'ellos',
  'ellas',
  'ese',
  'esa',
  'esos',
  'esas',
  'estos',
  'estas',
  'those',
  'these',
  'which one',
  'which of',
  'sus resultados',
  'su proceso',
  'su rol',
]

const FOLLOW_UP_INTENTS = [
  'compare the results',
  'what results',
  'what impact',
  'how did the design process',
  'how was the design process',
  'what was mateo s role',
  'which team',
  'compara los resultados',
  'que resultados',
  'que impacto',
  'como fue el proceso',
  'cual fue el rol',
  'que rol tuvo',
  'con que equipo',
]

export function isPortfolioFollowUp(question) {
  const normalized = normalize(question)
  if (!normalized) return false
  if (includesTerm(normalized, FOLLOW_UP_REFERENCES)) return true

  const wordCount = normalized.split(' ').filter(Boolean).length
  return wordCount <= 14 && includesTerm(normalized, FOLLOW_UP_INTENTS)
}

export function cleanAssistantText(value) {
  return String(value || '')
    .replace(/\[([^\]]+)]\([^\s)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function clipAtBoundary(text, maxLength) {
  if (text.length <= maxLength) return text

  const clipped = text.slice(0, maxLength)
  const lastSentenceEnd = Math.max(
    clipped.lastIndexOf('. '),
    clipped.lastIndexOf('! '),
    clipped.lastIndexOf('? '),
  )
  if (lastSentenceEnd >= maxLength * 0.4) return clipped.slice(0, lastSentenceEnd + 1).trim()

  const lastSpace = clipped.lastIndexOf(' ')
  return `${clipped.slice(0, lastSpace > maxLength * 0.7 ? lastSpace : maxLength).trim()}…`
}

export function responseLead(value, { rich = false, maxLength = 280 } = {}) {
  const clean = cleanAssistantText(value)
  if (!clean) return ''

  const firstBlock = rich ? clean.split(/\n+/).find(Boolean) || clean : clean
  return clipAtBoundary(firstBlock, maxLength)
}

export function classifyPortfolioPresentation({ question, answer }) {
  const normalized = normalize(question)
  const projectIds = Array.isArray(answer?.projectIds) ? answer.projectIds : []

  if (answer?.kind === 'profile-summary') return { kind: 'profile-overview', topic: 'profile' }
  if (answer?.confidence === 'low') return { kind: 'suggestions', topic: 'fallback' }

  const profile = profileTopic(normalized)
  if (profile) return { kind: 'profile-facts', topic: profile }

  if (includesTerm(normalized, METRIC_TERMS)) {
    return { kind: 'metric-grid', topic: 'impact' }
  }

  if (includesTerm(normalized, PROCESS_TERMS)) {
    return { kind: 'process-steps', topic: 'process' }
  }

  if (includesTerm(normalized, ROLE_TERMS)) {
    return { kind: 'role-brief', topic: 'role' }
  }

  if (projectIds.length > 1) return { kind: 'project-carousel', topic: 'projects' }
  if (projectIds.length === 1 && projectIds[0] !== 'rappi') {
    return { kind: 'project-spotlight', topic: 'project' }
  }

  return { kind: 'narrative', topic: 'general' }
}
