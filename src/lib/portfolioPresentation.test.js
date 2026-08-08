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
