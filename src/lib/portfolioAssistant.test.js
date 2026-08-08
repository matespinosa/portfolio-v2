import assert from 'node:assert/strict'
import test from 'node:test'
import { answerPortfolioQuestion } from './portfolioAssistant.js'

test('answers broad financial-product questions in Spanish', () => {
  const answer = answerPortfolioQuestion('¿Qué productos financieros ha diseñado Mateo?')

  assert.equal(answer.language, 'es')
  assert.equal(answer.confidence, 'high')
  assert.deepEqual(answer.projectIds, ['modyo', 'mibanco', 'credicorp', 'dando'])
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
  assert.match(answer.text, /does not contain a verifiable answer/)
})
