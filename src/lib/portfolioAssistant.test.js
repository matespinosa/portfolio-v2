import assert from 'node:assert/strict'
import test from 'node:test'
import { answerPortfolioQuestion, canAnswerLocally } from './portfolioAssistant.js'

test('answers broad financial-product questions in Spanish', () => {
  const answer = answerPortfolioQuestion('¿Qué productos financieros ha diseñado Mateo?')

  assert.equal(answer.language, 'es')
  assert.equal(answer.confidence, 'high')
  assert.deepEqual(answer.projectIds, ['mibanco', 'credicorp', 'dando', 'kapital'])
  assert.match(answer.text, /MiBanco/)
  assert.match(answer.text, /Dando by CFG/)
})

test('answers frontend questions from the profile', () => {
  const answer = answerPortfolioQuestion('How does front end experience shape his work?')

  assert.equal(answer.language, 'en')
  assert.deepEqual(answer.projectIds, [])
  assert.match(answer.text, /React/)
  assert.match(answer.text, /feasibility/)
})

test('answers career-role questions from the documented experience', () => {
  const answer = answerPortfolioQuestion('¿Qué cargos ha tenido Mateo?')

  assert.equal(answer.confidence, 'high')
  assert.match(answer.text, /más de seis años/i)
  assert.match(answer.text, /Kapital Bank/)
  assert.match(answer.text, /Credicorp Capital/)
  assert.match(answer.text, /Modyo Services/)
  assert.match(answer.text, /Brace Developers/)
})

test('distinguishes unpublished Kapital metrics from delivered design work', () => {
  const es = answerPortfolioQuestion('¿Cuáles son las métricas de Kapital?')
  const en = answerPortfolioQuestion('What metrics did Kapital achieve?')
  const outcomes = answerPortfolioQuestion('¿Qué resultados tuvo Kapital?')
  const comparison = answerPortfolioQuestion('Compare metrics for Kapital and MiBanco')

  assert.deepEqual(es.projectIds, ['kapital'])
  assert.match(es.text, /aún no están publicadas/)
  assert.match(en.text, /have not been published/)
  assert.match(outcomes.text, /entregables de diseño/)
  assert.match(comparison.text, /business metrics not yet published/)
  for (const answer of [es, en, outcomes, comparison]) assert.doesNotMatch(answer.text, /TODO|undefined/)
})

test('answers public professional contact questions while withholding unpublished personal details', () => {
  for (const question of ['¿Cuál es el correo de Mateo?', 'How can I contact Mateo?']) {
    const answer = answerPortfolioQuestion(question)
    assert.equal(answer.confidence, 'high')
    assert.match(answer.text, /matespinosa09@gmail\.com/)
    assert.match(answer.text, /linkedin\.com\/in\/mateo-espinosa/)
  }
  assert.equal(answerPortfolioQuestion('What is Mateo’s salary and email?').confidence, 'low')
})

test('answers AI-practice questions without treating AI as part of another word', () => {
  const answer = answerPortfolioQuestion('What does Mateo do with AI?')

  assert.equal(answer.confidence, 'high')
  assert.match(answer.text, /Cursor, Codex and Claude/)
})

test('routes design-system questions to the documented Modyo case', () => {
  const answer = answerPortfolioQuestion('What design systems has Mateo worked on?')

  assert.deepEqual(answer.projectIds, ['modyo'])
  assert.match(answer.text, /shared product foundations/)
})

test('returns a specific project and its documented outcomes', () => {
  const answer = answerPortfolioQuestion('What were the outcomes for Dando by CFG?')

  assert.deepEqual(answer.projectIds, ['dando'])
  assert.match(answer.text, /158%/)
})

test('tolerates a typo in a project name', () => {
  const answer = answerPortfolioQuestion('Tell me about Credicrop')

  assert.equal(answer.confidence, 'medium')
  assert.deepEqual(answer.projectIds, ['credicorp'])
  assert.match(answer.text, /foreign-currency/)
})

test('understands a spaced project alias in Spanish', () => {
  const answer = answerPortfolioQuestion('¿Qué hizo Mateo para Mi Banco?')

  assert.equal(answer.language, 'es')
  assert.deepEqual(answer.projectIds, ['mibanco'])
  assert.match(answer.text, /onboarding/)
})

test('returns documented quantified metrics', () => {
  const answer = answerPortfolioQuestion('What conversion metrics did Credicorp achieve?')

  assert.deepEqual(answer.projectIds, ['credicorp'])
  assert.match(answer.text, /US\$1.2B/)
})

test('does not expose personal details that are absent from the portfolio data', () => {
  const answer = answerPortfolioQuestion('¿Cuál es el salario de Mateo?')

  assert.equal(answer.language, 'es')
  assert.equal(answer.confidence, 'low')
  assert.deepEqual(answer.projectIds, [])
  assert.ok(answer.suggestions.length > 0)
})

test('redirects unrelated questions to supported portfolio topics', () => {
  const answer = answerPortfolioQuestion('What is the weather tomorrow?')

  assert.equal(answer.confidence, 'low')
  assert.deepEqual(answer.projectIds, [])
  assert.match(answer.text, /couldn't find that in the portfolio/)
  assert.ok(answer.suggestions.includes('What does Mateo do?'))
})

test('routes design-system questions ahead of the generic "worked with" clients answer', () => {
  const answer = answerPortfolioQuestion('¿Ha trabajado con sistemas de diseño?')

  assert.deepEqual(answer.projectIds, ['modyo'])
})

test('says undocumented organizations are not published cases instead of guessing a project', () => {
  const answer = answerPortfolioQuestion('¿Ha trabajado con Banca Mifel?')

  assert.match(answer.text, /no está documentado/)
  assert.equal(answer.projectIds.length, 5)
  assert.match(answerPortfolioQuestion('Did he work with Banca Mifel?').text, /not documented/)
})

test('answers Kapital questions from the factoring case study', () => {
  for (const question of ['¿Qué hizo en Kapital Bank?', 'Tell me about the factoring project', '¿Cómo funciona CesionBnk en el factoring?']) {
    const answer = answerPortfolioQuestion(question)

    assert.deepEqual(answer.projectIds, ['kapital'])
    assert.doesNotMatch(answer.text, /not documented|no está documentado/)
  }
})

test('answers questions about Rappi from the current role', () => {
  for (const question of ['¿Qué hizo en Rappi?', '¿Y en Rappi?']) {
    const answer = answerPortfolioQuestion(question)

    assert.equal(answer.confidence, 'high')
    assert.deepEqual(answer.projectIds, ['rappi'])
    assert.match(answer.text, /Merchants/)
  }
})

test('compares all cases for project-less impact, process and role questions', () => {
  const impact = answerPortfolioQuestion('¿Qué impacto tuvo su trabajo?')

  assert.equal(impact.confidence, 'high')
  assert.equal(impact.projectIds.length, 5)
  assert.match(impact.text, /resultados documentados/)
})

test('keeps Spanish answers free of English metric labels and section titles', () => {
  const metrics = answerPortfolioQuestion('¿Cuáles son las métricas de Credicorp?').text
  const process = answerPortfolioQuestion('¿Cómo fue el proceso de diseño en MiBanco?').text

  assert.match(metrics, /transado digitalmente \(primeros seis meses\)/)
  assert.doesNotMatch(metrics, /traded digitally|first six months/)
  assert.doesNotMatch(process, /the goal|curiosity to insight/i)
})

test('uses short project names in answers', () => {
  const answer = answerPortfolioQuestion('¿Qué resultados tuvo MiBanco?')

  assert.match(answer.text, /para MiBanco son/)
  assert.doesNotMatch(answer.text, /Web app transaction/)
})

test('detects Spanish greetings and short follow-ups as Spanish', () => {
  const greeting = answerPortfolioQuestion('hola')

  assert.equal(greeting.language, 'es')
  assert.match(greeting.text, /guía del portafolio/)
  assert.equal(answerPortfolioQuestion('¿Cuál de esos tuvo más impacto?').language, 'es')
})

test('writes English project answers in the third person', () => {
  const fx = answerPortfolioQuestion('Tell me about the FX module').text
  const frontend = answerPortfolioQuestion('Does he know React?').text

  assert.doesNotMatch(fx, /\bWe\b/)
  assert.doesNotMatch(fx, /\bI\b/)
  assert.match(frontend, /^Mateo has experience with React/)
  assert.doesNotMatch(answerPortfolioQuestion('What did he do at MiBanco?').text, /\bI led\b/)
})

test('summarizes the whole portfolio for open questions about what Mateo does', () => {
  const spanish = ['¿Qué hace Mateo?', 'Qué hace Mateo', '¿A qué se dedica Mateo?', 'Cuéntame sobre Mateo', '¿Quién es Mateo?', 'Resúmeme el perfil de Mateo', '¿Por qué debería contratar a Mateo?', '¿En qué es bueno?']
  const english = ['What does Mateo do?', 'Who is Mateo?', 'Tell me about Mateo', 'Give me a summary of his work', 'Why should I hire him?']

  for (const [questions, language] of [[spanish, 'es'], [english, 'en']]) {
    for (const question of questions) {
      const answer = answerPortfolioQuestion(question)

      assert.equal(answer.kind, 'profile-summary', question)
      assert.equal(answer.language, language, question)
      assert.equal(answer.confidence, 'high', question)
      assert.equal(answer.standalone, true, question)
      assert.deepEqual(answer.projectIds, ['modyo', 'mibanco', 'credicorp', 'dando', 'kapital'], question)
      assert.match(answer.text, /Rappi/, question)
    }
  }

  assert.match(answerPortfolioQuestion('¿Qué hace Mateo?').text, /factoring para pymes/)
  assert.equal(answerPortfolioQuestion('Mateo').kind, 'profile-summary')
  assert.match(answerPortfolioQuestion('What does Mateo do?').text, /US\$1\.2B/)
})

test('keeps specific questions ahead of the profile summary', () => {
  assert.deepEqual(answerPortfolioQuestion('¿Qué hace Mateo en Kapital?').projectIds, ['kapital'])
  assert.deepEqual(answerPortfolioQuestion('¿Qué hace Mateo actualmente?').projectIds, ['rappi'])
  assert.equal(answerPortfolioQuestion('Resumen de sus resultados').kind, undefined)
})

test('answers domain experience questions with the matching cases', () => {
  const answer = answerPortfolioQuestion('¿Tiene experiencia en B2B?')

  assert.match(answer.text, /^Sí\. /)
  assert.deepEqual(answer.projectIds, ['credicorp', 'kapital', 'modyo'])
  assert.deepEqual(answerPortfolioQuestion('Has he designed onboarding flows?').projectIds, ['mibanco', 'dando'])
})

test('keeps self-contained answers local mid-conversation and sends context-dependent ones to Gemini', () => {
  const history = [{ role: 'user', content: '¿Qué hizo en MiBanco?' }]

  assert.equal(canAnswerLocally({ history: [], localAnswer: answerPortfolioQuestion('¿Qué hace Mateo?') }), true)
  assert.equal(canAnswerLocally({ history, localAnswer: answerPortfolioQuestion('¿Qué hace Mateo?') }), true)
  assert.equal(canAnswerLocally({ history, localAnswer: answerPortfolioQuestion('¿Qué hizo en Credicorp?') }), true)
  assert.equal(canAnswerLocally({ history, localAnswer: answerPortfolioQuestion('¿Cuánto tiempo tomó?') }), false)
  assert.equal(canAnswerLocally({ history: [], localAnswer: answerPortfolioQuestion('¿Qué opina del diseño brutalista?') }), false)
})
