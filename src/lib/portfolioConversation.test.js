import assert from 'node:assert/strict'
import test from 'node:test'
import { answerPortfolioConversation } from './portfolioConversation.js'

const history = [
  { role: 'assistant', content: 'MiBanco', projectIds: ['mibanco'] },
  { role: 'user', content: 'Que Que hace Mateo en rapi' },
  { role: 'assistant', content: 'Rappi', projectIds: ['rappi'] },
]

test('keeps short follow-ups scoped to Rappi without borrowing results or process from other cases', () => {
  for (const language of ['es', 'en']) {
    for (const question of ['¿Y qué resultados tuvo?', '¿Y el proceso?', '¿Y su rol?', '¿Cuánto tiempo tomó?', 'What about the results?', 'And the team?']) {
      const answer = answerPortfolioConversation(question, history, { language })
      assert.equal(answer.language, language, question)
      assert.equal(answer.kind, undefined, question)
      assert.deepEqual(answer.projectIds, ['rappi'], question)
      assert.doesNotMatch(answer.text, /MiBanco|Modyo|Credicorp|158%|US\$1.2B|14 minutes|14 minutos/, question)
      if (/result/i.test(question)) assert.match(answer.text, /25%/, question)
      if (/proceso/i.test(question)) assert.match(answer.text, /Claude Code|Cursor/, question)
      if (/tiempo/i.test(question)) assert.match(answer.text, /2025/, question)
      if (/team/i.test(question)) assert.match(answer.text, /QA/, question)
    }
  }
})

test('an explicit company or a general profile question overrides earlier context', () => {
  assert.deepEqual(answerPortfolioConversation('¿Y qué hizo en Credicrop?', history).projectIds, ['credicorp'])
  assert.deepEqual(answerPortfolioConversation('¿Y qué hizo en Mi Banco?', history).projectIds, ['mibanco'])
  assert.equal(answerPortfolioConversation('¿Qué hace Mateo?', history).kind, 'profile-summary')
})

test('does not revive an old company after the conversation moved to a different topic', () => {
  const answer = answerPortfolioConversation('¿Y qué resultados tuvo?', [
    ...history,
    { role: 'assistant', content: 'Frontend', projectIds: [] },
  ])
  assert.notEqual(answer.kind, 'current-role')
  assert.ok(answer.projectIds.length > 1)
})
