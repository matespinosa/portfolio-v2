import assert from 'node:assert/strict'
import test from 'node:test'
import { createPortfolioDictation } from './portfolioDictation.js'

function setup({ startError, supported = true } = {}) {
  const instances = []
  const drafts = []
  const states = []
  const feedback = []
  class Recognition {
    constructor() { instances.push(this) }
    start() { if (startError) throw startError }
    stop() { this.stopped = true }
    abort() { this.aborted = true }
  }
  const dictation = createPortfolioDictation({
    SpeechRecognition: supported ? Recognition : undefined,
    onDraft: (draft) => drafts.push(draft),
    onState: (state) => states.push(state),
    onFeedback: (message) => feedback.push(message),
  })
  return { dictation, instances, drafts, states, feedback }
}

const result = (transcript, isFinal = false) => Object.assign([{ transcript }], { isFinal })

test('blocks a second microphone session while permission/startup is pending', () => {
  const { dictation, instances, states } = setup()
  assert.equal(dictation.start(), true)
  assert.equal(dictation.start(), false)
  assert.equal(instances.length, 1)
  assert.deepEqual(states, ['starting'])
  dictation.stop()
  assert.equal(instances[0].aborted, true)
  assert.equal(states.at(-1), 'idle')
  assert.equal(dictation.start(), true)
})

test('replaces interim text instead of duplicating it and preserves the original draft', () => {
  const { dictation, instances, drafts, feedback } = setup()
  dictation.start('Quiero conocer')
  const recognition = instances[0]
  recognition.onstart()
  recognition.onresult({ results: [result('los pro')] })
  recognition.onresult({ results: [result('los proyectos', true), result('financieros', true)] })
  recognition.onend()
  assert.deepEqual(drafts, ['Quiero conocer los pro', 'Quiero conocer los proyectos financieros'])
  assert.match(feedback.at(-1), /Revisa el texto/)
  assert.equal(recognition.lang, 'es-CO')
})

test('stopping accepts the last recognition result before releasing the microphone', () => {
  const { dictation, instances, drafts, states } = setup()
  dictation.start()
  const recognition = instances[0]
  recognition.onstart()
  dictation.stop()
  assert.equal(recognition.stopped, true)
  assert.equal(states.at(-1), 'stopping')
  recognition.onresult({ results: [result('Háblame de Mateo', true)] })
  recognition.onend()
  assert.equal(drafts.at(-1), 'Háblame de Mateo')
  assert.equal(states.at(-1), 'idle')
})

test('closing, sending or editing cancels dictation and ignores delayed events', () => {
  const { dictation, instances, drafts, states } = setup()
  dictation.start('Primer borrador')
  const recognition = instances[0]
  const delayedResult = recognition.onresult
  const delayedEnd = recognition.onend
  dictation.cancel()
  dictation.start('Nueva pregunta')
  delayedResult({ results: [result('texto antiguo', true)] })
  delayedEnd()
  assert.equal(recognition.aborted, true)
  assert.deepEqual(drafts, [])
  assert.equal(states.at(-1), 'starting')
  instances[1].onresult({ results: [result('sobre Rappi', true)] })
  assert.equal(drafts.at(-1), 'Nueva pregunta sobre Rappi')
})

test('permission rejection remains visible after the service ends and allows retrying', () => {
  const { dictation, instances, feedback, states } = setup()
  dictation.start()
  const delayedEnd = instances[0].onend
  instances[0].onerror({ error: 'not-allowed' })
  delayedEnd()
  assert.match(feedback.at(-1), /Permite el micrófono/)
  assert.equal(states.at(-1), 'idle')
  assert.equal(instances[0].aborted, true)
  assert.equal(dictation.start(), true)
})

test('handles synchronous startup failures without leaving the button active', () => {
  const { dictation, states, feedback, instances } = setup({ startError: { name: 'NotAllowedError' } })
  assert.equal(dictation.start(), false)
  assert.equal(states.at(-1), 'idle')
  assert.equal(instances[0].aborted, true)
  assert.match(feedback.at(-1), /Permite el micrófono/)
})

test('offers keyboard dictation in an unsupported browser', () => {
  const { dictation, states, feedback } = setup({ supported: false })
  assert.equal(dictation.start(), false)
  assert.deepEqual(states, [])
  assert.match(feedback.at(-1), /micrófono de tu teclado/)
})

test('distinguishes silence and network errors, and caps dictated input at 1200 characters', () => {
  const { dictation, instances, feedback, drafts } = setup()
  dictation.start()
  instances[0].onend()
  assert.match(feedback.at(-1), /No detecté voz/)
  dictation.start()
  instances[1].onerror({ error: 'network' })
  assert.match(feedback.at(-1), /conexión/)
  dictation.start('Texto')
  instances[2].onresult({ results: [result('a'.repeat(1300), true)] })
  assert.equal(drafts.at(-1).length, 1200)
})

test('unmount releases the microphone without updating the removed interface', () => {
  const { dictation, instances, states, feedback } = setup()
  dictation.start()
  dictation.cancel({ notify: false })
  assert.equal(instances[0].aborted, true)
  assert.deepEqual(states, ['starting'])
  assert.equal(feedback.length, 1)
})
