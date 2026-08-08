import Fuse from 'fuse.js'
import { profile } from '../data/profile.js'
import { experience, projects, selectedClients } from '../data/projects.js'

const SUGGESTIONS = {
  en: [
    'What fintech products has Mateo designed?',
    'How does frontend experience shape his design work?',
    'What is Mateo currently building at Rappi?',
  ],
  es: [
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
}

const PROJECT_TOPICS = {
  modyo: ['dxp', 'digital experience platform', 'design system', 'sistema de diseno', 'low code', 'micro frontend'],
  mibanco: ['onboarding', 'transactions', 'transacciones', 'payments', 'pagos', 'credit', 'credito', 'digital banking'],
  credicorp: ['corporate fx', 'foreign exchange', 'divisas', 'treasury', 'tesoreria', 'cambio', 'backoffice'],
  dando: ['digital lending', 'prestamos digitales', 'lending', 'kyc', 'backoffice', 'simulador', 'loan simulator'],
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
    role: 'Product Designer enfocado en discovery y rebranding',
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
}

const DELIVERY_ES = {
  modyo: { team: 'ingeniería, producto, marketing y QA', duration: 'una colaboración integral de plataforma' },
  mibanco: { team: 'producto, research, desarrollo, QA y branding', duration: 'un proyecto de principio a fin' },
  credicorp: { team: 'clientes corporativos, tesorería, operaciones e ingeniería', duration: 'una iniciativa de plataforma' },
  dando: { team: 'CFG Partners, ventas, riesgo, tesorería e ingeniería', duration: 'una colaboración para el MVP' },
}

const SPANISH_MARKERS = new Set([
  'actualmente',
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

function makeAnswer({ text, language, projectIds = [], confidence = 'high', suggestions = [] }) {
  return { text, language, projectIds, suggestions, confidence }
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

function answerProject(project, intent, language, confidence = 'high') {
  if (intent === 'unsupported-metrics') {
    const metrics = project.metrics.map((metric) => `${metric.value} ${metric.label} (${metric.detail})`)
    return makeAnswer({
      language,
      projectIds: [project.id],
      confidence: 'high',
      text:
        language === 'es'
          ? `Las métricas documentadas para ${project.title} son:\n${bulletList(metrics)}`
          : `The documented metrics for ${project.title} are:\n${bulletList(metrics)}`,
    })
  }

  if (language === 'es') {
    const copy = PROJECT_ES[project.id]
    const delivery = DELIVERY_ES[project.id]
    const answers = {
      overview: `${copy.summary}\n\nSu rol fue ${copy.role} y el alcance incluyó ${copy.scope}.`,
      role: `En ${project.title}, Mateo trabajó como ${copy.role}. Su responsabilidad cubrió ${copy.scope}.`,
      scope: `El trabajo de Mateo en ${project.title} abarcó ${copy.scope}. ${copy.summary}`,
      outcomes: `Los resultados documentados para ${project.title} son:\n${bulletList(copy.outcomes)}`,
      delivery: `Mateo trabajó en ${project.title} junto con ${delivery.team}. El portafolio describe la duración como ${delivery.duration}.`,
    }
    return makeAnswer({ text: answers[intent], language, projectIds: [project.id], confidence })
  }

  const answers = {
    overview: `${toThirdPerson(project.intro)}\n\nMateo worked as ${project.role}. The scope covered ${project.scope}.`,
    role: `On ${project.title}, Mateo worked as ${project.role}. His responsibility covered ${project.scope}.`,
    scope: `Mateo's work on ${project.title} covered ${project.scope}. ${toThirdPerson(project.intro)}`,
    outcomes: `The documented outcomes for ${project.title} are:\n${bulletList(project.outcomes)}`,
    delivery: `Mateo worked on ${project.title} with ${project.team.toLowerCase()}. The portfolio describes the duration as ${project.duration.toLowerCase()}.`,
  }
  return makeAnswer({ text: answers[intent], language, projectIds: [project.id], confidence })
}

function answerProjectSet(matchedProjects, language) {
  const lines = matchedProjects.map((project) => {
    if (language === 'es') {
      return `${project.title} — ${PROJECT_ES[project.id].role}; ${PROJECT_ES[project.id].scope}.`
    }
    return `${project.title} — ${project.role}; ${project.scope}.`
  })

  return makeAnswer({
    language,
    projectIds: matchedProjects.map((project) => project.id),
    text:
      language === 'es'
        ? `Estos son los casos que coinciden con la pregunta:\n${bulletList(lines)}`
        : `These are the cases that match the question:\n${bulletList(lines)}`,
  })
}

function answerAllProjects(language, financialOnly = false) {
  const selected = projects
  const lines = selected.map((project) => {
    const category = language === 'es' ? PROJECT_ES[project.id].category : project.category
    return `${project.title} — ${category}`
  })

  return makeAnswer({
    language,
    projectIds: selected.map((project) => project.id),
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
              : 'The portfolio presents four product cases:'
          }\n${bulletList(lines)}`,
  })
}

function answerUnsupported(context, language) {
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

export function answerPortfolioQuestion(question) {
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

  const exactMatches = exactProjectMatches(context)
  const intent = projectIntent(context)

  if (intent === 'unsupported-metrics' && exactMatches.length) {
    return answerProject(exactMatches[0], intent, language)
  }

  const unsupported = answerUnsupported(context, language)
  if (unsupported) return unsupported

  if (exactMatches.length > 1) return answerProjectSet(exactMatches, language)
  if (exactMatches.length === 1) return answerProject(exactMatches[0], intent, language)

  if (matchesAny(context, ['current role', 'currently', 'now', 'rol actual', 'actualmente', 'ahora', 'dónde trabaja', 'donde trabaja'])) {
    return makeAnswer({
      language,
      projectIds: ['rappi'],
      text:
        language === 'es'
          ? `Mateo trabaja actualmente como Product Designer en Merchants de ${profile.currentRole.company}. Su alcance cubre Restaurantes y Mi Tienda, incluida la unificación de Portal Partners y Portal Aliados mediante Rappi DS.`
          : `Mateo currently works as ${profile.currentRole.role} at ${profile.currentRole.company}. His scope covers Restaurants and Mi Tienda, including the unification of Portal Partners and Portal Aliados using Rappi DS.`,
    })
  }

  if (matchesAny(context, ['frontend', 'front end', 'react', 'next.js', 'nextjs', 'html', 'css', 'javascript', 'development', 'desarrollo'])) {
    return makeAnswer({
      language,
      text:
        language === 'es'
          ? 'Mateo tiene experiencia con React, Next.js, HTML, CSS y JavaScript. Usa ese conocimiento para evaluar viabilidad, crear prototipos y colaborar más cerca de ingeniería.'
          : profile.frontend,
    })
  }

  if (matchesAny(context, ['ai', 'artificial intelligence', 'ai practice', 'cursor', 'codex', 'claude', 'inteligencia artificial', 'práctica de ia', 'practica de ia', 'ia'])) {
    return makeAnswer({
      language,
      text:
        language === 'es'
          ? 'Desde 2025, Mateo usa Cursor, Codex y Claude para prototipar, evaluar y llevar ideas a producción más rápido, manteniendo el criterio de producto y diseño como centro de las decisiones.'
          : profile.aiPractice,
    })
  }

  if (matchesAny(context, ['experience', 'background', 'career', 'years', 'trajectory', 'experiencia', 'trayectoria', 'carrera', 'años', 'anos'])) {
    return makeAnswer({
      language,
      text:
        language === 'es'
          ? 'Mateo tiene más de seis años de experiencia entre productos digitales y frontend, incluidos más de cinco años enfocados en diseño de producto. Su trayectoria combina productos financieros, plataformas operativas y sistemas de diseño.'
          : `${profile.summary} His background combines financial products, operational platforms and design systems.`,
    })
  }

  if (matchesAny(context, ['location', 'based', 'located', 'ubicado', 'vive', 'ciudad'])) {
    return makeAnswer({
      language,
      text:
        language === 'es'
          ? `Mateo está basado en ${profile.location}.`
          : `Mateo is based in ${profile.location}.`,
    })
  }

  if (matchesAny(context, ['clients', 'companies', 'organizations', 'worked with', 'clientes', 'empresas', 'organizaciones', 'trabajado con'])) {
    const clientNames = selectedClients.map((client) => client.org).join(', ')
    return makeAnswer({
      language,
      projectIds: projects.map((project) => project.id),
      text:
        language === 'es'
          ? `El portafolio documenta trabajo para ${clientNames}. El portafolio de Modyo también incluye Banco Mundo Mujer, Sura y PS Factory.`
          : `The portfolio documents work for ${clientNames}. The Modyo portfolio also includes Banco Mundo Mujer, Sura and PS Factory.`,
    })
  }

  if (matchesAny(context, ['fintech', 'financial products', 'finance products', 'banking products', 'productos financieros', 'productos bancarios', 'finanzas'])) {
    return answerAllProjects(language, true)
  }

  if (matchesAny(context, ['design system', 'design systems', 'component system', 'sistema de diseño', 'sistemas de diseño', 'sistema de componentes'])) {
    return answerProject(projectById('modyo'), 'scope', language)
  }

  const fuzzyMatch = fuzzyProjectMatch(context)
  if (fuzzyMatch) return answerProject(fuzzyMatch, intent, language, 'medium')

  if (matchesAny(context, ['projects', 'portfolio', 'case studies', 'work', 'proyectos', 'portafolio', 'casos', 'trabajos'])) {
    return answerAllProjects(language)
  }

  if (matchesAny(context, ['skills', 'capabilities', 'practice', 'strategy', 'design', 'habilidades', 'capacidades', 'práctica', 'practica', 'estrategia', 'diseño', 'diseno'])) {
    return makeAnswer({
      language,
      text:
        language === 'es'
          ? 'La práctica de Mateo cubre estrategia de producto, productos financieros, operaciones para comercios, onboarding, transacciones, crédito, sistemas de diseño y flujos B2B complejos.'
          : profile.design,
    })
  }

  if (matchesAny(context, ['roles', 'employment', 'history', 'experiencia laboral', 'historial'])) {
    return makeAnswer({
      language,
      text:
        language === 'es'
          ? `La experiencia documentada incluye:\n${bulletList(experience.map((item) => `${item.org}: ${item.role} (${item.span})`))}`
          : `The documented experience includes:\n${bulletList(experience.map((item) => `${item.org}: ${item.role} (${item.span})`))}`,
    })
  }

  return makeAnswer({
    language,
    confidence: 'low',
    suggestions: SUGGESTIONS[language],
    text:
      language === 'es'
        ? 'El portafolio no contiene una respuesta verificable para esa pregunta. Puedo ayudarte con los proyectos, la experiencia, los clientes, frontend o la práctica de diseño de Mateo.'
        : "The portfolio does not contain a verifiable answer to that question. I can help with Mateo's projects, experience, clients, frontend or design practice.",
  })
}
