import assert from 'node:assert/strict'
import test from 'node:test'
import {
  classifyPortfolioPresentation,
  cleanAssistantText,
  isPortfolioFollowUp,
  responseLead,
} from './portfolioPresentation.js'

const answer = (projectIds = [], confidence = 'high') => ({ projectIds, confidence })

test('uses a carousel for broad multi-project questions', () => {
  assert.deepEqual(
    classifyPortfolioPresentation({
      question: '¿Qué productos financieros ha diseñado Mateo?',
      answer: answer(['mibanco', 'credicorp', 'dando']),
    }),
    { kind: 'project-carousel', topic: 'projects' },
  )
})

test('uses a metric grid for impact follow-ups', () => {
  assert.equal(
    classifyPortfolioPresentation({
      question: '¿Y qué resultados tuvo?',
      answer: answer(['mibanco']),
    }).kind,
    'metric-grid',
  )
})

test('uses process and role patterns for their corresponding intents', () => {
  assert.equal(
    classifyPortfolioPresentation({
      question: '¿Cómo fue el proceso de investigación?',
      answer: answer(['mibanco']),
    }).kind,
    'process-steps',
  )
  assert.equal(
    classifyPortfolioPresentation({
      question: '¿Cuál fue su rol y con qué equipo trabajó?',
      answer: answer(['credicorp']),
    }).kind,
    'role-brief',
  )
})

test('uses profile facts for frontend and current-role questions', () => {
  assert.deepEqual(
    classifyPortfolioPresentation({
      question: '¿Cómo usa frontend en su trabajo?',
      answer: answer(),
    }),
    { kind: 'profile-facts', topic: 'frontend' },
  )
  assert.equal(
    classifyPortfolioPresentation({
      question: '¿Cuál es su rol actual en Rappi?',
      answer: answer(['rappi']),
    }).topic,
    'current',
  )
  assert.equal(
    classifyPortfolioPresentation({
      question: '¿Qué cargos ha tenido Mateo?',
      answer: answer(),
    }).topic,
    'experience',
  )
})

test('recognizes contextual follow-ups without treating a new named project as implicit', () => {
  assert.equal(isPortfolioFollowUp('Compara los resultados de estos proyectos.'), true)
  assert.equal(isPortfolioFollowUp('¿Cómo fue el proceso de diseño?'), true)
  assert.equal(isPortfolioFollowUp('¿Qué resultados tuvo MiBanco?'), true)
})

test('cleans markdown and extracts a compact lead', () => {
  const value = 'Participó en estos proyectos:\n- **MiBanco:** banca digital.\n- Dando: crédito.'

  assert.equal(
    cleanAssistantText(value),
    'Participó en estos proyectos:\nMiBanco: banca digital.\nDando: crédito.',
  )
  assert.equal(responseLead(value, { rich: true }), 'Participó en estos proyectos:')
})

test('treats demonstrative references to earlier answers as follow-ups', () => {
  assert.equal(isPortfolioFollowUp('¿Cuál de esos tuvo más impacto?'), true)
  assert.equal(isPortfolioFollowUp('Which of those had more impact?'), true)
})

test('keeps whole sentences when clipping long leads', () => {
  const value =
    'Mateo diseñó productos para banca minorista y crédito digital. En MiBanco redujo la apertura de cuenta de 14 minutos a 4:30 y aumentó las cuentas nuevas en un 32% durante el primer trimestre.'
  const lead = responseLead(value, { maxLength: 90 })

  assert.equal(lead, 'Mateo diseñó productos para banca minorista y crédito digital.')
  assert.equal(responseLead(value, { maxLength: 400 }), value)
  assert.ok(responseLead('palabra '.repeat(30), { maxLength: 60 }).endsWith('…'))
})

test('uses the profile overview for portfolio-wide summaries', () => {
  assert.deepEqual(
    classifyPortfolioPresentation({
      question: '¿Quién es Mateo?',
      answer: { ...answer(['modyo', 'mibanco']), kind: 'profile-summary' },
    }),
    { kind: 'profile-overview', topic: 'profile' },
  )
  assert.equal(
    classifyPortfolioPresentation({ question: '¿Cuál es su trayectoria?', answer: answer() }).topic,
    'experience',
  )
})
