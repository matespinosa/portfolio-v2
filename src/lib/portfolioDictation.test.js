import assert from 'node:assert/strict'
import test from 'node:test'
import { createPortfolioDictation } from './portfolioDictation.js'

function setup({ startError, supported = true, lang = 'en-US', requestMicrophone } = {}) {
  const instances = []
  const drafts = []
  const states = []
  const feedback = []
  class Recognition {
    constructor() { instances.push(this) }
    start() { if (startError) throw startError; this.started = true }
    stop() { this.stopped = true }
    abort() { this.aborted = true }
  }
  const dictation = createPortfolioDictation({
    lang,
    requestMicrophone,
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
  assert.match(feedback.at(-1), /Review the text/)
  assert.equal(recognition.lang, 'en-US')
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
  assert.match(feedback.at(-1), /Allow microphone access/)
  assert.equal(states.at(-1), 'idle')
  assert.equal(instances[0].aborted, true)
  assert.equal(dictation.start(), true)
})

test('handles synchronous startup failures without leaving the button active', () => {
  const { dictation, states, feedback, instances } = setup({ startError: { name: 'NotAllowedError' } })
  assert.equal(dictation.start(), false)
  assert.equal(states.at(-1), 'idle')
  assert.equal(instances[0].aborted, true)
  assert.match(feedback.at(-1), /Allow microphone access/)
})

test('offers keyboard dictation in an unsupported browser', () => {
  const { dictation, states, feedback } = setup({ supported: false })
  assert.equal(dictation.start(), false)
  assert.deepEqual(states, [])
  assert.match(feedback.at(-1), /your keyboard’s microphone/)
})

test('distinguishes silence and network errors, and caps dictated input at 1200 characters', () => {
  const { dictation, instances, feedback, drafts } = setup()
  dictation.start()
  instances[0].onend()
  assert.match(feedback.at(-1), /No speech detected/)
  dictation.start()
  instances[1].onerror({ error: 'network' })
  assert.match(feedback.at(-1), /connection/)
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


test('dictates in the selected Spanish locale and localizes every microphone state', () => {
  const { dictation, instances, feedback } = setup({ lang: 'es-CO' })
  dictation.start()
  assert.equal(instances[0].lang, 'es-CO')
  assert.equal(feedback.at(-1), 'Iniciando micrófono…')
  instances[0].onstart()
  assert.match(feedback.at(-1), /Escuchando/)
  instances[0].onresult({ results: [result('Qué hace Mateo', true)] })
  assert.match(feedback.at(-1), /Dictado listo/)
  dictation.stop()
  assert.match(feedback.at(-1), /Terminando dictado/)
  instances[0].onend()
  dictation.start()
  instances[1].onerror({ error: 'not-allowed' })
  assert.match(feedback.at(-1), /Permite el acceso al micrófono/)
  const unsupported = setup({ lang: 'es-CO', supported: false })
  assert.equal(unsupported.dictation.start(), false)
  assert.match(unsupported.feedback.at(-1), /Este navegador no admite dictado/)
})

test('requests microphone permission before starting recognition and releases the preflight stream', async () => {
  let resolvePermission
  let trackStopped = false
  const { dictation, instances, states, feedback } = setup({
    requestMicrophone: () => new Promise((resolve) => { resolvePermission = resolve }),
  })
  dictation.start('Draft')
  assert.equal(instances[0].started, undefined)
  assert.equal(states.at(-1), 'starting')
  assert.match(feedback.at(-1), /Allow microphone access to start/)
  resolvePermission({ getTracks: () => [{ stop: () => { trackStopped = true } }] })
  await Promise.resolve()
  assert.equal(trackStopped, true)
  assert.equal(instances[0].started, true)
  instances[0].onstart()
  instances[0].onresult({ results: [result('my question', true)] })
  dictation.stop()
  instances[0].onend()
  assert.equal(states.at(-1), 'idle')
})

test('ignores a late permission grant after cancellation and releases its microphone', async () => {
  let grantPermission
  let stopped = false
  const { dictation, instances, states } = setup({ requestMicrophone: () => new Promise((resolve) => { grantPermission = resolve }) })
  dictation.start()
  dictation.cancel()
  grantPermission({ getTracks: () => [{ stop: () => { stopped = true } }] })
  await Promise.resolve()
  assert.equal(stopped, true)
  assert.equal(instances[0].started, undefined)
  assert.equal(states.at(-1), 'idle')
})

test('reports permission denial without starting recognition', async () => {
  const { dictation, instances, states, feedback } = setup({ requestMicrophone: () => Promise.reject({ name: 'NotAllowedError' }) })
  dictation.start()
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal(states.at(-1), 'idle')
  assert.equal(instances[0].started, undefined)
  assert.match(feedback.at(-1), /Allow microphone access in this site/)
})

test('recovers when the browser never settles the permission request', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const { dictation, instances, states, feedback } = setup({ lang: 'es-CO', requestMicrophone: () => new Promise(() => {}) })
  dictation.start()
  t.mock.timers.tick(15_000)
  assert.equal(states.at(-1), 'idle')
  assert.match(feedback.at(-1), /El navegador no respondió/)
  assert.equal(instances[0].started, undefined)
  assert.equal(dictation.start(), true)
  dictation.cancel()
})

test('recovers when the exposed speech service never starts and ignores delayed events', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const { dictation, instances, states, feedback, drafts } = setup()
  dictation.start()
  const delayedStart = instances[0].onstart
  const delayedResult = instances[0].onresult
  t.mock.timers.tick(8_000)
  assert.equal(states.at(-1), 'idle')
  assert.match(feedback.at(-1), /Speech recognition did not start/)
  assert.equal(instances[0].aborted, true)
  assert.equal(dictation.start(), true)
  delayedStart()
  delayedResult({ results: [result('old session', true)] })
  assert.deepEqual(drafts, [])
  assert.equal(states.at(-1), 'starting')
  dictation.cancel()
})

test('audio capture or a result can confirm listening when the engine omits the start event', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const { dictation, instances, states } = setup()
  dictation.start()
  instances[0].onaudiostart()
  t.mock.timers.tick(8_000)
  assert.equal(states.at(-1), 'listening')
  dictation.cancel()
  dictation.start()
  instances[1].onresult({ results: [result('Hello', true)] })
  assert.equal(states.at(-1), 'listening')
  dictation.cancel()
})

test('stop recovers from a missing end event and preserves the transcribed draft', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const { dictation, instances, states, drafts, feedback } = setup()
  dictation.start('Existing')
  instances[0].onstart()
  instances[0].onresult({ results: [result('question', true)] })
  dictation.stop()
  t.mock.timers.tick(2_000)
  assert.equal(states.at(-1), 'idle')
  assert.equal(drafts.at(-1), 'Existing question')
  assert.match(feedback.at(-1), /Dictation ready/)
  assert.equal(dictation.start(), true)
  dictation.cancel()
})

test('unmount cancels watchdogs and late microphone permission cannot restart dictation', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  let grantPermission
  let stopped = false
  const { dictation, instances, states, feedback } = setup({ requestMicrophone: () => new Promise((resolve) => { grantPermission = resolve }) })
  dictation.start()
  dictation.cancel({ notify: false })
  t.mock.timers.tick(20_000)
  grantPermission({ getTracks: () => [{ stop: () => { stopped = true } }] })
  await Promise.resolve()
  assert.equal(stopped, true)
  assert.equal(instances[0].started, undefined)
  assert.deepEqual(states, ['starting'])
  assert.equal(feedback.length, 1)
})

test('switches a failed native service to local dictation and forwards cancellation', () => {
  let fallbackStarts = 0, canceled = false
  const instances = []
  const states = []
  class Recognition {
    constructor() { instances.push(this) }
    start() {}
    abort() { this.aborted = true }
  }
  const dictation = createPortfolioDictation({
    SpeechRecognition: Recognition,
    lang: 'es-CO', onDraft() {}, onFeedback() {}, onState: (state) => states.push(state),
    createFallback: ({ lang, onState }) => {
      assert.equal(lang, 'es-CO')
      return {
        start(draft) { assert.equal(draft, 'Borrador'); fallbackStarts++; onState('loading'); return true },
        cancel() { canceled = true; onState('idle') },
      }
    },
  })
  dictation.start('Borrador')
  instances[0].onerror({ error: 'network' })
  assert.equal(fallbackStarts, 1)
  assert.equal(instances[0].aborted, true)
  assert.equal(states.at(-1), 'loading')
  assert.equal(dictation.start(), false)
  dictation.cancel()
  assert.equal(canceled, true)
  assert.equal(states.at(-1), 'idle')
  dictation.start('Borrador')
  assert.equal(instances.length, 1)
  assert.equal(fallbackStarts, 2)
  dictation.cancel()
})
