import assert from 'node:assert/strict'
import test from 'node:test'
import { requestPortfolioAnswer, serializeChatHistory } from './portfolioChatApi.js'

test('serializes only the last six chat messages', () => {
  const history = serializeChatHistory(
    Array.from({ length: 8 }, (_, index) => ({
      role: index % 2 ? 'assistant' : 'user',
      content: `Message ${index}`,
      projectIds: index === 7 ? ['mibanco'] : [],
    })),
  )

  assert.equal(history.length, 6)
  assert.equal(history[0].content, 'Message 2')
  assert.deepEqual(history.at(-1).projectIds, ['mibanco'])
})

test('posts a question and history to the portfolio endpoint', async () => {
  let body
  const answer = await requestPortfolioAnswer({
    question: '¿Y qué resultados tuvo?',
    history: [{ role: 'assistant', content: 'MiBanco', projectIds: ['mibanco'] }],
    fetchImpl: async (url, options) => {
      assert.equal(url, '/api/chat')
      body = JSON.parse(options.body)
      return Response.json({ text: 'Redujo el tiempo.', source: 'gemini' })
    },
  })

  assert.equal(body.question, '¿Y qué resultados tuvo?')
  assert.equal(answer.source, 'gemini')
})

