import Fuse from 'fuse.js'
import { profile } from '../data/profile.js'
import { experience, projects, selectedClients } from '../data/projects.js'
import {
  CURRENT_ROLE_ES,
  EXPERIENCE_ES,
  EXPERIENCE_SPAN_ES,
  METRIC_DETAILS_ES,
  METRIC_LABELS_ES,
  PROCESS_COPY_ES,
  PROCESS_TITLES_EN,
  SHORT_TITLES,
} from '../data/copyEs.js'

const SUGGESTIONS = {
  en: [
    'What does Mateo do?',
    'What fintech products has Mateo designed?',
    'How does frontend experience shape his design work?',
    'What is Mateo currently building at Rappi?',
  ],
  es: [
    '¿Qué hace Mateo?',
    '¿Qué productos financieros ha diseñado Mateo?',
    '¿Cómo influye su experiencia frontend en su trabajo?',
    '¿Qué está diseñando actualmente en Rappi?',
  ],
}

const PROJECT_ALIASES = {
  modyo: ['modyo', 'modyo platform', 'dxp', 'low code', 'low-code'],
  mibanco: ['mibanco', 'mi banco', 'cdt', 'cdts'],
  credicorp: ['credicorp', 'credicorp capital', 'corporate fx'],
  dando: ['dando', 'dando by cfg', 'cfg partners', 'libranza'],
  kapital: ['kapital', 'kapital bank', 'kapital colombia', 'factoring', 'cesionbnk', 'radian'],
}

const GREETINGS = ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'hello', 'hi', 'hey', 'good morning']

const UNDOCUMENTED_ORGS = ['banca mifel', 'mifel']

// Open questions about who Mateo is or what he does get a portfolio-wide summary.
const SUMMARY_PHRASES = [
  'que hace mateo',
  'que hace',
  'que haces',
  'a que se dedica',
  'a que te dedicas',
  'quien es',
  'cuentame sobre mateo',
  'cuentame de mateo',
  'cuentame sobre el',
  'hablame de mateo',
  'hablame sobre mateo',
  'sobre mateo',
  'su trabajo',
  'resumen',
  'resumeme',
  'resume',
  'resumir',
  'perfil',
  'presentacion',
  'por que contratar',
  'por que deberia contratar',
  'por que contratarlo',
  'que tipo de disenador',
  'que clase de disenador',
  'en que es bueno',
  'fortalezas',
  'que sabe hacer',
  'what does mateo do',
  'what does he do',
  'what mateo does',
  'who is',
  'tell me about mateo',
  'tell me about him',
  'about mateo',
  'his work',
  'mateo s work',
  'summary',
  'summarize',
  'summarise',
  'overview',
  'profile',
  'introduce',
  'why hire',
  'why should i hire',
  'why should we hire',
  'what kind of designer',
  'what type of designer',
  'what is he good at',
  'strengths',
  'what can he do',
  'in a nutshell',
]

// Domains that map to several documented cases; checked before the generic experience answer.
const DOMAIN_ROUTES = [
  { phrases: ['b2b', 'corporate', 'corporativo', 'corporativa', 'corporativos', 'enterprise', 'saas'], ids: ['credicorp', 'kapital', 'modyo'] },
  { phrases: ['onboarding', 'kyc', 'apertura de cuenta', 'account opening'], ids: ['mibanco', 'dando'] },
  { phrases: ['backoffice', 'back office', 'herramientas internas', 'internal tools'], ids: ['credicorp', 'dando'] },
  { phrases: ['credito', 'creditos', 'credit', 'lending', 'prestamo', 'prestamos', 'loan', 'loans'], ids: ['mibanco', 'dando'] },
]

const YES_NO_PHRASES = [
  'tiene experiencia',
  'ha trabajado',
  'ha disenado',
  'ha hecho',
  'sabe de',
  'has he',
  'does he have',
  'did he',
  'is he',
  'has experience',
  'have experience',
]

const SUMMARY_DOMAIN_ORDER = ['mibanco', 'credicorp', 'dando', 'kapital', 'modyo']
const SUMMARY_DOMAINS = {
  es: {
    mibanco: 'banca digital',
    credicorp: 'divisas corporativas',
    dando: 'crédito digital',
    kapital: 'factoring para pymes',
    modyo: 'una plataforma de experiencia digital usada por bancos',
  },
  en: {
    mibanco: 'digital banking',
    credicorp: 'corporate FX',
    dando: 'digital lending',
    kapital: 'SME factoring',
    modyo: 'a digital experience platform used by banks',
  },
}
const SUMMARY_HIGHLIGHT_IDS = ['credicorp', 'mibanco', 'dando']

const PROJECT_TOPICS = {
  modyo: ['dxp', 'digital experience platform', 'design system', 'sistema de diseno', 'low code', 'micro frontend'],
  mibanco: ['onboarding', 'transactions', 'transacciones', 'payments', 'pagos', 'credit', 'credito', 'digital banking'],
  credicorp: ['corporate fx', 'foreign exchange', 'divisas', 'treasury', 'tesoreria', 'cambio', 'backoffice'],
  dando: ['digital lending', 'prestamos digitales', 'lending', 'kyc', 'backoffice', 'simulador', 'loan simulator'],
  kapital: ['factoring', 'facturas', 'invoices', 'factura electronica', 'e-invoice', 'radian', 'cesion', 'working capital', 'capital de trabajo', 'pymes', 'sme financing'],
}

const PROJECT_ES = {
  modyo: {
    category: 'plataforma de experiencia digital, sistema de diseño y low-code',
    role: 'Product Designer enfocado en investigación y sistemas de diseño',
    scope: 'Modyo 10, herramientas low-code y fundamentos compartidos de producto',
    summary: 'Mateo investigó, diseñó, validó y llevó a implementación piezas clave de Modyo, una plataforma usada por bancos y fintechs en Latinoamérica.',
    outcomes: ['48% de tiempo de desarrollo ahorrado frente a una meta de 40%', '92% de éxito de tarea en pruebas moderadas', '78% de mejora UX al resolver inconsistencias de la plataforma'],
  },
  mibanco: {
    category: 'plataforma de banca digital',
    role: 'Senior Product Designer enfocado en discovery y sistemas de diseño',
    scope: 'onboarding, transacciones, productos de crédito y gestión de CDTs',
    summary: 'Mateo lideró investigación, sistema de diseño y handoff para modernizar el canal digital de MiBanco.',
    outcomes: ['Apertura de cuenta reducida de 14 minutos a 4 minutos 30 segundos', '84/100 en System Usability Scale', '+32% de cuentas nuevas en el primer trimestre post-lanzamiento'],
  },
  credicorp: {
    category: 'banca corporativa y divisas',
    role: 'Senior Product Designer enfocado en discovery y rebranding',
    scope: 'transacciones, backoffice, FX y formularios de cumplimiento',
    summary: 'Mateo convirtió un proceso telefónico de FX en una experiencia digital para negociar, reservar y liquidar operaciones de divisas.',
    outcomes: ['US$1.2B transados digitalmente en los primeros seis meses', '96% de reducción en el tiempo del ciclo de liquidación', '340 horas de operaciones ahorradas al mes'],
  },
  dando: {
    category: 'crédito digital y onboarding',
    role: 'Product Designer enfocado en discovery y sistemas de diseño',
    scope: 'simulador de crédito, KYC, onboarding y backoffice comercial',
    summary: 'Mateo transformó el proceso de crédito de CFG Partners en una experiencia 100% digital sin perder la cercanía humana.',
    outcomes: ['+158% de nuevos clientes después del MVP', '+233% de solicitudes procesadas después del MVP', '+45% de ganancia neta en eficiencia operativa'],
  },
  kapital: {
    category: 'financiamiento para pymes y factoring',
    role: 'Lead Product Designer de principio a fin',
    scope: 'benchmark, reglas de negocio, integración con CesionBnk y RADIAN, y el dashboard de factoring',
    summary: 'Mateo lideró de principio a fin el producto de factoring de Kapital en Colombia, desde el benchmark y las reglas de negocio hasta el dashboard con el que las pymes financian sus facturas.',
    outcomes: ['Dashboard de factoring con búsqueda, filtros y seguimiento de operaciones', 'Estados claros para validación, aprobación y desembolso de facturas', 'Resumen de operación con descuento, total a financiar y monto a recibir'],
  },
}

const DELIVERY_ES = {
  modyo: { team: 'ingeniería, producto, marketing y QA', duration: 'una colaboración integral de plataforma' },
  mibanco: { team: 'producto, research, desarrollo, QA y branding', duration: 'un proyecto de principio a fin' },
  credicorp: { team: 'clientes corporativos, tesorería, operaciones e ingeniería', duration: 'una iniciativa de plataforma' },
  dando: { team: 'CFG Partners, ventas, riesgo, tesorería e ingeniería', duration: 'una colaboración para el MVP' },
  kapital: { team: 'la Country Manager de Colombia, producto México y Colombia, comercial, contabilidad e ingeniería', duration: 'el lanzamiento del producto en 2025' },
}

const SPANISH_MARKERS = new Set([
  'actualmente',
  'con',
  'cuales',
  'cuanto',
  'cuantos',
  'de',
  'del',
  'el',
  'en',
  'es',
  'fue',
  'gracias',
  'hizo',
  'hola',
  'impacto',
  'las',
  'los',
  'mas',
  'proceso',
  'quien',
  'rol',
  'sabe',
  'sus',
  'tiene',
  'tuvo',
  'una',
  'usa',
  'anos',
  'banca',
  'clientes',
  'como',
  'cual',
  'donde',
  'diseno',
  'esta',
  'experiencia',
  'hace',
  'habilidades',
  'proyecto',
  'proyectos',
  'que',
  'resultados',
  'trabaja',
  'trabajo',
])

const ENGLISH_MARKERS = new Set([
  'about',
  'and',
  'has',
  'he',
  'hello',
  'his',
  'is',
  'me',
  'tell',
  'the',
  'thanks',
  'to',
  'clients',
  'current',
  'designed',
  'does',
  'experience',
  'how',
  'projects',
  'role',
  'skills',
  'what',
  'where',
  'which',
  'work',
])

const GENERIC_TOKENS = new Set([
  'about',
  'general',
  'give',
  'overview',
  'perfil',
  'profile',
  'resumen',
  'summary',
  'tell',
  'case',
  'caso',
  'como',
  'current',
  'design',
  'designed',
  'designer',
  'diseno',
  'does',
  'esta',
  'bank',
  'banco',
  'banca',
  'banking',
  'hace',
  'mateo',
  'para',
  'portfolio',
  'product',
  'producto',
  'productos',
  'project',
  'projects',
  'proyecto',
  'proyectos',
  'resultados',
  'role',
  'sobre',
  'trabajo',
  'what',
  'with',
])

function normalize(value) {
  return String(value)
    .toLocaleLowerCase('en')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function questionContext(question) {
  const normalized = normalize(question)
  return {
    normalized,
    tokens: new Set(normalized.split(' ').filter(Boolean)),
  }
}

function matchesAny(context, phrases) {
  return phrases.some((phrase) => {
    const normalizedPhrase = normalize(phrase)
    return normalizedPhrase.includes(' ')
      ? context.normalized.includes(normalizedPhrase)
      : context.tokens.has(normalizedPhrase)
  })
}

function detectLanguage(question) {
  if (/[\u00bf¡áéíóúñ]/i.test(question)) return 'es'

  const tokens = normalize(question).split(' ')
  const spanishScore = tokens.filter((token) => SPANISH_MARKERS.has(token)).length
  const englishScore = tokens.filter((token) => ENGLISH_MARKERS.has(token)).length
  return spanishScore > englishScore ? 'es' : 'en'
}

function toThirdPerson(text) {
  return text
    .replace(/\bMy work\b/g, "Mateo's work")
    .replace(/\bI own\b/g, 'Mateo owns')
    .replace(/\bI owned\b/g, 'Mateo owned')
    .replace(/\bI helped\b/g, 'Mateo helped')
    .replace(/\bI worked\b/g, 'Mateo worked')
    .replace(/\bI also\b/g, 'Mateo also')
    .replace(/\bI use\b/g, 'Mateo uses')
    .replace(/\bmy\b/g, 'his')
    .replace(/\b(Designer) I (?=[a-z]+ed\b|led\b)/g, '$1, Mateo ')
    .replace(/\bI (?=[a-z]+ed\b|led\b)/g, 'Mateo ')
    .replace(/(^|[.!?]\s+)We\b/g, '$1The team')
    .replace(/\bwe\b/g, 'the team')
    .replace(/\basked us\b/g, 'asked the team')
    .replace(/\bour\b/g, "the team's")
}

function titleOf(project) {
  return SHORT_TITLES[project.id] || project.title
}

function metricText(metric, language) {
  if (language !== 'es') return `${metric.value} ${metric.label} (${metric.detail})`
  return `${metric.value} ${METRIC_LABELS_ES[metric.label] || metric.label} (${METRIC_DETAILS_ES[metric.detail] || metric.detail})`
}

function metricShortText(metric, language) {
  const label = language === 'es' ? METRIC_LABELS_ES[metric.label] || metric.label : metric.label
  return `${metric.value} ${label}`
}

function processTitles(project, language, limit = 4) {
  if (language === 'es') {
    return (PROCESS_COPY_ES[project.id] || []).slice(0, limit).map((step) => step.title.toLowerCase())
  }
  return (PROCESS_TITLES_EN[project.id] || []).slice(0, limit)
}

function lowerFirst(value) {
  return value.replace(/^(?!Modyo)([A-Z])(?=[a-z])/, (letter) => letter.toLowerCase())
}

function joinList(items, language) {
  if (items.length < 2) return items.join('')
  const conjunction = language === 'es' ? 'y' : 'and'
  return `${items.slice(0, -1).join(', ')} ${conjunction} ${items.at(-1)}`
}

const searchRecords = projects.map((project) => ({
  id: project.id,
  title: project.title,
  aliases: PROJECT_ALIASES[project.id],
  topics: PROJECT_TOPICS[project.id],
  content: [
    project.category,
    project.role,
    project.scope,
    project.intro,
    ...project.body,
    ...project.outcomes,
    PROJECT_ES[project.id].category,
    PROJECT_ES[project.id].scope,
    PROJECT_ES[project.id].summary,
    ...PROJECT_ES[project.id].outcomes,
  ].join(' '),
}))

const projectSearch = new Fuse(searchRecords, {
  includeScore: true,
  ignoreDiacritics: true,
  ignoreLocation: true,
  threshold: 0.45,
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'aliases', weight: 0.3 },
    { name: 'topics', weight: 0.2 },
    { name: 'content', weight: 0.1 },
  ],
})

function projectById(id) {
  return projects.find((project) => project.id === id)
}

function exactProjectMatches(context) {
  return projects.filter((project) =>
    PROJECT_ALIASES[project.id].some((alias) => context.normalized.includes(normalize(alias))),
  )
}

export function mentionedProjectIds(question) {
  return exactProjectMatches(questionContext(question)).map((project) => project.id)
}

function fuzzyProjectMatch(context) {
  const terms = context.normalized
    .split(' ')
    .filter((token) => token.length >= 4 && !GENERIC_TOKENS.has(token))

  if (!terms.length) return null

  const scores = new Map()
  for (const term of terms) {
    for (const result of projectSearch.search(term, { limit: 3 })) {
      if ((result.score ?? 1) > 0.4) continue
      const strength = 1 - (result.score ?? 1)
      scores.set(result.item.id, (scores.get(result.item.id) ?? 0) + strength)
    }
  }

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1])
  if (!ranked.length) return null
  if (ranked[1] && ranked[0][1] - ranked[1][1] < 0.12) return null
  return projectById(ranked[0][0])
}

// `standalone` marks answers that do not depend on earlier messages, so they stay local
// even mid-conversation and the Gemini quota is kept for open or context-dependent questions.
function makeAnswer({ text, language, projectIds = [], confidence = 'high', suggestions = [], kind, standalone = false }) {
  return { text, language, projectIds, suggestions, confidence, kind, standalone }
}

export function canAnswerLocally({ history = [], localAnswer }) {
  if (localAnswer?.confidence !== 'high') return false
  return history.length === 0 || Boolean(localAnswer.standalone)
}

function answerProfileSummary(language) {
  const city = profile.location.split(',')[0]
  const domains = joinList(
    SUMMARY_DOMAIN_ORDER
      .filter((id) => projectById(id))
      .map((id) => SUMMARY_DOMAINS[language][id]),
    language,
  )
  const highlights = SUMMARY_HIGHLIGHT_IDS
    .map(projectById)
    .filter((project) => project?.metrics.length)
    .map((project) => `${titleOf(project)}: ${metricText(project.metrics[0], language)}`)

  const text = language === 'es'
    ? `Mateo es Product Designer con experiencia frontend, basado en ${city}. Hoy diseña en ${profile.currentRole.company} para Merchants: restaurantes y Mi Tienda. Suma más de seis años entre productos digitales y frontend, más de cinco en diseño de producto, sobre todo en productos financieros y plataformas complejas: ${domains}. Diseña con criterio de implementación (React, Next.js) y usa IA para prototipar y validar más rápido.\n\nResultados destacados:\n${bulletList(highlights)}`
    : `Mateo is a product designer with frontend experience, based in ${city}. He currently designs for Merchants at ${profile.currentRole.company}, covering Restaurants and Mi Tienda. He has more than six years across digital products and frontend, more than five of them in product design, mostly on financial products and complex platforms: ${domains}. He designs with implementation judgment (React, Next.js) and uses AI to prototype and validate faster.\n\nSelected results:\n${bulletList(highlights)}`

  return makeAnswer({
    language,
    text,
    kind: 'profile-summary',
    standalone: true,
    projectIds: projects.map((project) => project.id),
  })
}

function bulletList(items) {
  return items.map((item) => `• ${item}`).join('\n')
}

function projectIntent(context) {
  if (matchesAny(context, ['metrics', 'metric', 'kpi', 'percentage', 'revenue', 'métricas', 'métrica', 'porcentaje', 'ingresos'])) {
    return 'unsupported-metrics'
  }
  if (matchesAny(context, ['outcomes', 'outcome', 'results', 'result', 'impact', 'logros', 'resultados', 'resultado', 'impacto'])) {
    return 'outcomes'
  }
  if (matchesAny(context, ['process', 'method', 'research', 'discovery', 'validation', 'proceso', 'metodología', 'metodologia', 'investigación', 'investigacion', 'descubrimiento', 'validación', 'validacion'])) {
    return 'process'
  }
  if (matchesAny(context, ['team', 'duration', 'long', 'equipo', 'duración', 'tiempo'])) {
    return 'delivery'
  }
  if (matchesAny(context, ['role', 'current role', 'current', 'currently', 'responsibility', 'responsibilities', 'ownership', 'rol', 'rol actual', 'actual', 'actualmente', 'responsabilidad', 'responsabilidades', 'lideró', 'lidero'])) {
    return 'role'
  }
  if (matchesAny(context, ['scope', 'worked on', 'did', 'built', 'alcance', 'trabajó', 'trabajo', 'hizo', 'diseñó', 'diseno'])) {
    return 'scope'
  }
  return 'overview'
}

function answerProject(project, intent, language, confidence = 'high', standalone = false) {
  if (intent === 'unsupported-metrics') {
    const metrics = project.metrics.map((metric) => metricText(metric, language))
    const text = metrics.length > 0
      ? (language === 'es'
          ? `Las métricas documentadas para ${titleOf(project)} son:\n${bulletList(metrics)}`
          : `The documented metrics for ${titleOf(project)} are:\n${bulletList(metrics)}`)
      : (language === 'es'
          ? `Las métricas de negocio de ${titleOf(project)} aún no están publicadas. El caso documenta el alcance y los entregables de diseño, sin atribuirles resultados medidos.`
          : `Business metrics for ${titleOf(project)} have not been published. The case documents the scope and design deliverables without claiming measured results.`)
    return makeAnswer({
      language,
      projectIds: [project.id],
      confidence: 'high',
      standalone,
      text,
    })
  }

  const name = titleOf(project)

  if (language === 'es') {
    const copy = PROJECT_ES[project.id]
    const delivery = DELIVERY_ES[project.id]
    const answers = {
      overview: `${copy.summary}\n\nSu rol fue ${copy.role} y el alcance incluyó ${copy.scope}.`,
      role: `En ${name}, Mateo trabajó como ${copy.role}. Su responsabilidad cubrió ${copy.scope}.`,
      scope: `El trabajo de Mateo en ${name} abarcó ${copy.scope}. ${copy.summary}`,
      outcomes: `${project.outcomesLabel ? 'Los entregables de diseño documentados' : 'Los resultados documentados'} para ${name} son:\n${bulletList(copy.outcomes)}`,
      process: `El proceso de ${name} conectó investigación, diseño, validación e implementación. El caso documenta ${joinList(processTitles(project, language), language)}.`,
      delivery: `Mateo trabajó en ${name} junto con ${delivery.team}. El portafolio describe la duración como ${delivery.duration}.`,
    }
    return makeAnswer({ text: answers[intent], language, projectIds: [project.id], confidence, standalone })
  }

  const answers = {
    overview: `${toThirdPerson(project.intro)}\n\nMateo worked as ${project.role}. The scope covered ${lowerFirst(project.scope)}.`,
    role: `On ${name}, Mateo worked as ${project.role}. His responsibility covered ${lowerFirst(project.scope)}.`,
    scope: `Mateo's work on ${name} covered ${lowerFirst(project.scope)}. ${toThirdPerson(project.intro)}`,
    outcomes: `The documented ${project.outcomesLabel ? 'design deliverables' : 'outcomes'} for ${name} are:\n${bulletList(project.outcomes)}`,
    process: `The ${name} process connected research, design, validation and implementation. The case documents ${joinList(processTitles(project, language), language)}.`,
    delivery: `Mateo worked on ${name} with ${project.team.toLowerCase()}. The portfolio describes the duration as ${project.duration.toLowerCase()}.`,
  }
  return makeAnswer({ text: answers[intent], language, projectIds: [project.id], confidence, standalone })
}

function answerProjectSet(matchedProjects, language, intent = 'overview', { lead = '', standalone = false } = {}) {
  const lines = matchedProjects.map((project) => {
    if (language === 'es') {
      const copy = PROJECT_ES[project.id]
      const variants = {
        overview: `${copy.category}; ${copy.scope}`,
        role: `${copy.role}; ${copy.scope}`,
        scope: copy.scope,
        process: processTitles(project, 'es', 3).join(' · '),
        outcomes: copy.outcomes.slice(0, 2).join('; '),
        'unsupported-metrics': project.metrics
          .slice(0, 2)
          .map((metric) => metricShortText(metric, 'es'))
          .join('; ') || 'métricas de negocio aún no publicadas',
        delivery: DELIVERY_ES[project.id].team,
      }
      return `${titleOf(project)} — ${variants[intent] || variants.overview}.`
    }
    const variants = {
      overview: `${project.category}; ${project.scope}`,
      role: `${project.role}; ${project.scope}`,
      scope: project.scope,
      process: processTitles(project, 'en', 3).join(' · '),
      outcomes: project.outcomes.slice(0, 2).join('; '),
      'unsupported-metrics': project.metrics
        .slice(0, 2)
        .map((metric) => metricShortText(metric, 'en'))
        .join('; ') || 'business metrics not yet published',
      delivery: project.team,
    }
    return `${titleOf(project)} — ${variants[intent] || variants.overview}.`
  })

  const introductions = {
    es: {
      overview: 'Estos son los casos que coinciden con la pregunta:',
      role: 'Así cambió el rol de Mateo entre los proyectos:',
      scope: 'Estos fueron los alcances principales:',
      process: 'Cada proyecto siguió un proceso adaptado a su contexto:',
      outcomes: 'Estos son los resultados documentados que puedes comparar:',
      'unsupported-metrics': 'Estas son las métricas documentadas que puedes comparar:',
      delivery: 'Estos fueron los equipos involucrados:',
    },
    en: {
      overview: 'These are the cases that match the question:',
      role: "This is how Mateo's role changed across the projects:",
      scope: 'These were the main areas of scope:',
      process: 'Each project followed a process adapted to its context:',
      outcomes: 'These are the documented outcomes you can compare:',
      'unsupported-metrics': 'These are the documented metrics you can compare:',
      delivery: 'These were the teams involved:',
    },
  }

  return makeAnswer({
    language,
    projectIds: matchedProjects.map((project) => project.id),
    standalone,
    text: `${lead ? `${lead} ` : ''}${introductions[language][intent] || introductions[language].overview}\n${bulletList(lines)}`,
  })
}

function answerAllProjects(language, financialOnly = false) {
  const selected = financialOnly
    ? projects.filter((project) => project.id !== 'modyo')
    : projects
  const lines = selected.map((project) => {
    const category = language === 'es' ? PROJECT_ES[project.id].category : project.category
    return `${titleOf(project)} — ${category}`
  })

  return makeAnswer({
    language,
    projectIds: selected.map((project) => project.id),
    standalone: true,
    text:
      language === 'es'
        ? `${
            financialOnly
              ? 'Mateo ha diseñado productos financieros en cuatro contextos:'
              : 'El portafolio presenta cinco casos de producto:'
          }\n${bulletList(lines)}`
        : `${
            financialOnly
              ? 'Mateo has designed financial products across four contexts:'
              : 'The portfolio presents five product cases:'
          }\n${bulletList(lines)}`,
  })
}

function answerUnsupported(context, language) {
  if (matchesAny(context, ['contact', 'contacto', 'contactar', 'email', 'correo', 'linkedin']) &&
      !matchesAny(context, ['salary', 'compensation', 'age', 'phone', 'address', 'salario', 'sueldo', 'edad', 'teléfono', 'telefono', 'dirección', 'direccion'])) {
    return makeAnswer({
      language,
      standalone: true,
      text: language === 'es'
        ? `Puedes contactar a Mateo en ${profile.contact.email} o a través de LinkedIn: ${profile.contact.linkedin}`
        : `You can contact Mateo at ${profile.contact.email} or on LinkedIn: ${profile.contact.linkedin}`,
    })
  }
  if (!matchesAny(context, ['salary', 'compensation', 'age', 'phone', 'email', 'address', 'salario', 'sueldo', 'edad', 'teléfono', 'telefono', 'correo', 'dirección', 'direccion'])) {
    return null
  }

  return makeAnswer({
    language,
    confidence: 'low',
    suggestions: SUGGESTIONS[language],
    text:
      language === 'es'
        ? 'El portafolio no incluye ese dato personal. Puedo responder sobre la experiencia, los proyectos, los clientes y las capacidades profesionales de Mateo.'
        : "The portfolio does not include that personal detail. I can answer about Mateo's experience, projects, clients and professional capabilities.",
  })
}

export function answerPortfolioQuestion(question, { projectIds: contextualProjectIds = [] } = {}) {
  const language = detectLanguage(question)
  const context = questionContext(question)

  if (!context.normalized) {
    return makeAnswer({
      language,
      confidence: 'low',
      suggestions: SUGGESTIONS[language],
      text: language === 'es' ? 'Escribe una pregunta sobre el trabajo de Mateo.' : "Ask a question about Mateo's work.",
    })
  }

  if (context.tokens.size <= 3 && matchesAny(context, GREETINGS)) {
    return makeAnswer({
      language,
      standalone: true,
      text:
        language === 'es'
          ? 'Hola, soy la guía del portafolio de Mateo. Puedes preguntarme por sus proyectos, resultados, rol actual en Rappi o práctica frontend.'
          : "Hi, I'm the guide to Mateo's portfolio. Ask me about his projects, results, current role at Rappi or frontend practice.",
    })
  }

  const exactMatches = exactProjectMatches(context)
  const intent = projectIntent(context)

  if (!exactMatches.length && matchesAny(context, UNDOCUMENTED_ORGS)) {
    const list = projects.map((project) => `${titleOf(project)} — ${language === 'es' ? PROJECT_ES[project.id].category : project.category}`)
    return makeAnswer({
      language,
      projectIds: projects.map((project) => project.id),
      standalone: true,
      text:
        language === 'es'
          ? `Ese trabajo no está documentado como caso en este portafolio. Los casos publicados son:\n${bulletList(list)}`
          : `That work is not documented as a case in this portfolio. The published cases are:\n${bulletList(list)}`,
    })
  }

  if (intent === 'unsupported-metrics' && exactMatches.length === 1) {
    return answerProject(exactMatches[0], intent, language, 'high', true)
  }

  const unsupported = answerUnsupported(context, language)
  if (unsupported) return unsupported

  if (exactMatches.length > 1) return answerProjectSet(exactMatches, language, intent, { standalone: true })
  if (exactMatches.length === 1) return answerProject(exactMatches[0], intent, language, 'high', true)

  const contextualProjects = projects.filter((project) => contextualProjectIds.includes(project.id))
  if (contextualProjects.length === 1) {
    return answerProject(contextualProjects[0], intent, language)
  }
  if (contextualProjects.length > 1) {
    return answerProjectSet(contextualProjects, language, intent)
  }

  if (matchesAny(context, ['current role', 'currently', 'now', 'rappi', 'merchants', 'mi tienda', 'rol actual', 'actualmente', 'ahora', 'dónde trabaja', 'donde trabaja'])) {
    return makeAnswer({
      language,
      projectIds: ['rappi'],
      standalone: true,
      text:
        language === 'es'
          ? `Mateo trabaja actualmente como Product Designer en Merchants de ${profile.currentRole.company}. Su alcance cubre ${CURRENT_ROLE_ES.scope.charAt(0).toLowerCase()}${CURRENT_ROLE_ES.scope.slice(1)}`
          : `Mateo currently works as ${profile.currentRole.role} at ${profile.currentRole.company}. His scope covers Restaurants and Mi Tienda, including the unification of Portal Partners and Portal Aliados using Rappi DS.`,
    })
  }

  if (matchesAny(context, ['frontend', 'front end', 'react', 'next.js', 'nextjs', 'html', 'css', 'javascript', 'development', 'desarrollo'])) {
    return makeAnswer({
      language,
      standalone: true,
      text:
        language === 'es'
          ? 'Mateo tiene experiencia con React, Next.js, HTML, CSS y JavaScript. Usa ese conocimiento para evaluar viabilidad, crear prototipos y colaborar más cerca de ingeniería.'
          : 'Mateo has experience with React, Next.js, HTML, CSS and JavaScript. He uses that implementation knowledge to improve feasibility, prototyping and collaboration with engineering.',
    })
  }

  if (matchesAny(context, ['ai', 'artificial intelligence', 'ai practice', 'cursor', 'codex', 'claude', 'inteligencia artificial', 'práctica de ia', 'practica de ia', 'ia'])) {
    return makeAnswer({
      language,
      standalone: true,
      text:
        language === 'es'
          ? 'Desde 2025, Mateo usa Cursor, Codex y Claude para prototipar, evaluar y llevar ideas a producción más rápido, manteniendo el criterio de producto y diseño como centro de las decisiones.'
          : profile.aiPractice,
    })
  }

  if (matchesAny(context, ['engineers', 'engineering', 'developers', 'ingenieria', 'ingenieros', 'desarrolladores', 'handoff'])) {
    return answerProjectSet(projects, language, 'delivery')
  }

  const domain = DOMAIN_ROUTES.find((route) => matchesAny(context, route.phrases))
  if (domain) {
    const lead = matchesAny(context, YES_NO_PHRASES) ? (language === 'es' ? 'Sí.' : 'Yes.') : ''
    return answerProjectSet(domain.ids.map(projectById).filter(Boolean), language, intent, { lead, standalone: true })
  }

  const isBareName = ['mateo', 'mateo espinosa'].includes(context.normalized)
  if ((isBareName || matchesAny(context, SUMMARY_PHRASES)) && !['outcomes', 'process', 'unsupported-metrics', 'delivery', 'role'].includes(intent)) {
    return answerProfileSummary(language)
  }

  if (matchesAny(context, ['experience', 'background', 'career', 'years', 'trajectory', 'roles', 'employment', 'history', 'experiencia', 'trayectoria', 'carrera', 'años', 'anos', 'cargos', 'experiencia laboral', 'historial'])) {
    return makeAnswer({
      language,
      standalone: true,
      text:
        language === 'es'
          ? `Mateo tiene más de seis años de experiencia entre productos digitales y frontend, incluidos más de cinco años enfocados en diseño de producto. Su trayectoria publicada es:\n${bulletList(experience.map((item) => `${item.org} · ${EXPERIENCE_ES[item.org] || item.role} · ${EXPERIENCE_SPAN_ES[item.span] || item.span}`))}`
          : `${profile.summary} His published experience is:\n${bulletList(experience.map((item) => `${item.org} · ${item.role} · ${item.span}`))}`,
    })
  }

  if (matchesAny(context, ['location', 'based', 'located', 'ubicado', 'vive', 'ciudad'])) {
    return makeAnswer({
      language,
      standalone: true,
      text:
        language === 'es'
          ? `Mateo está basado en ${profile.location}.`
          : `Mateo is based in ${profile.location}.`,
    })
  }

  if (matchesAny(context, ['design system', 'design systems', 'component system', 'sistema de diseño', 'sistemas de diseño', 'sistema de componentes'])) {
    return answerProject(projectById('modyo'), 'scope', language, 'high', true)
  }

  if (matchesAny(context, ['clients', 'companies', 'organizations', 'worked with', 'clientes', 'empresas', 'organizaciones', 'trabajado con'])) {
    const clientNames = selectedClients.map((client) => client.org).join(', ')
    return makeAnswer({
      language,
      projectIds: projects.map((project) => project.id),
      standalone: true,
      text:
        language === 'es'
          ? `El portafolio documenta trabajo para ${clientNames}. El portafolio de Modyo también incluye Banco Mundo Mujer, Sura y PS Factory.`
          : `The portfolio documents work for ${clientNames}. The Modyo portfolio also includes Banco Mundo Mujer, Sura and PS Factory.`,
    })
  }

  if (matchesAny(context, ['fintech', 'financial products', 'finance products', 'banking products', 'productos financieros', 'productos bancarios', 'finanzas'])) {
    return answerAllProjects(language, true)
  }

  const fuzzyMatch = fuzzyProjectMatch(context)
  if (fuzzyMatch) return answerProject(fuzzyMatch, intent, language, 'medium')

  if (['unsupported-metrics', 'outcomes', 'process', 'role'].includes(intent)) {
    return answerProjectSet(projects, language, intent)
  }

  if (matchesAny(context, ['projects', 'portfolio', 'case studies', 'work', 'proyectos', 'portafolio', 'casos', 'trabajos'])) {
    return answerAllProjects(language)
  }

  if (matchesAny(context, ['skills', 'capabilities', 'practice', 'strategy', 'design', 'habilidades', 'capacidades', 'práctica', 'practica', 'estrategia', 'diseño', 'diseno'])) {
    return makeAnswer({
      language,
      standalone: true,
      text:
        language === 'es'
          ? 'La práctica de Mateo cubre estrategia de producto, productos financieros, operaciones para comercios, onboarding, transacciones, crédito, sistemas de diseño y flujos B2B complejos.'
          : "Mateo's practice covers product strategy, financial products, merchant operations, onboarding, transactions, credit products, design systems and complex B2B workflows.",
    })
  }

  return makeAnswer({
    language,
    confidence: 'low',
    suggestions: SUGGESTIONS[language],
    text:
      language === 'es'
        ? 'No encuentro ese dato en el portafolio. Lo que sí puedo contarte: Mateo es Product Designer con experiencia frontend, enfocado en productos financieros y plataformas complejas. Prueba con una de estas preguntas.'
        : "I couldn't find that in the portfolio. What I can tell you: Mateo is a product designer with frontend experience, focused on financial products and complex platforms. Try one of these questions.",
  })
}
