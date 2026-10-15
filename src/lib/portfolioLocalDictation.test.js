import assert from 'node:assert/strict'
import test from 'node:test'
import { createLocalDictation, toSpeechSamples } from './portfolioLocalDictation.js'

const settle = () => new Promise((resolve) => setImmediate(resolve))

function setup({ silent = false, prepare, getUserMedia, transcribe } = {}) {
  const states = [], drafts = [], feedback = [], recorders = [], tracks = []
  const stream = { getTracks: () => tracks }
  tracks.push({ stopped: false, stop() { this.stopped = true } })
  class Recorder {
    constructor() { this.state = 'inactive'; this.mimeType = 'audio/webm'; recorders.push(this) }
    start() { this.state = 'recording' }
    stop() {
      this.state = 'inactive'
      this.ondataavailable?.({ data: new Blob(['test']) })
      this.onstop?.()
    }
  }
  class Context {
    decodeAudioData() {
      return Promise.resolve({ length: 8000, sampleRate: 16000, numberOfChannels: 1, getChannelData: () => new Float32Array(8000).fill(silent ? 0 : 0.2) })
    }
    close() { return Promise.resolve() }
  }
  const dictation = createLocalDictation({
    lang: 'es-CO',
    mediaDevices: { getUserMedia: getUserMedia || (() => Promise.resolve(stream)) },
    MediaRecorder: Recorder,
    AudioContext: Context,
    speech: {
      prepare: prepare || (() => Promise.resolve()),
      transcribe: transcribe || (async (audio, language) => {
        assert.equal(language, 'es')
        assert.ok(audio instanceof Float32Array)
        assert.equal(tracks[0].stopped, true)
        return '¿Qué hace Mateo?'
      }),
    },
    onState: (state) => states.push(state),
    onDraft: (draft) => drafts.push(draft),
    onFeedback: (text) => feedback.push(text),
  })
  return { dictation, states, drafts, feedback, recorders, tracks, stream }
}

test('local dictation records, stops the microphone, and transcribes in the selected language', async () => {
  const { dictation, states, drafts, feedback, recorders, tracks } = setup()
  dictation.start('Hola')
  assert.equal(dictation.start(), false)
  assert.equal(states.at(-1), 'loading')
  await settle()
  assert.equal(states.at(-1), 'listening')
  assert.equal(recorders[0].state, 'recording')
  assert.match(feedback.at(-1), /Escuchando en tu dispositivo/)
  dictation.stop()
  await settle()
  assert.equal(tracks[0].stopped, true)
  assert.equal(states.at(-1), 'idle')
  assert.equal(drafts.at(-1), 'Hola ¿Qué hace Mateo?')
  assert.match(feedback.at(-1), /Dictado listo/)
})

test('silence is not sent to the model and does not create invented words', async () => {
  let called = false
  const { dictation, drafts, feedback } = setup({ silent: true, transcribe: async () => { called = true; return 'hallucination' } })
  dictation.start()
  await settle()
  dictation.stop()
  await settle()
  assert.equal(called, false)
  assert.deepEqual(drafts, [])
  assert.match(feedback.at(-1), /No se detectó voz/)
})

test('cancellation during loading does not open the microphone later', async () => {
  let loaded, microphoneRequested = false
  const { dictation, states } = setup({
    prepare: () => new Promise((resolve) => { loaded = resolve }),
    getUserMedia: () => { microphoneRequested = true },
  })
  dictation.start()
  await settle()
  dictation.cancel({ notify: false })
  loaded()
  await settle()
  assert.equal(microphoneRequested, false)
  assert.deepEqual(states, ['loading'])
})

test('cancellation while waiting for permission stops any late microphone tracks', async () => {
  let allowed
  const { dictation, tracks, stream, recorders } = setup({ getUserMedia: () => new Promise((resolve) => { allowed = resolve }) })
  dictation.start()
  await settle()
  dictation.cancel()
  allowed(stream)
  await settle()
  assert.equal(tracks[0].stopped, true)
  assert.equal(recorders.length, 0)
})

test('closing while transcribing preserves later edits and ignores the old transcript', async () => {
  let complete
  const { dictation, drafts, states } = setup({ transcribe: () => new Promise((resolve) => { complete = resolve }) })
  dictation.start()
  await settle()
  dictation.stop()
  await settle()
  assert.equal(states.at(-1), 'transcribing')
  dictation.cancel()
  complete('old text')
  await settle()
  assert.deepEqual(drafts, [])
  assert.equal(states.at(-1), 'idle')
})

test('failed model downloads leave the microphone closed and allow retrying', async () => {
  const { dictation, states, feedback, recorders } = setup({ prepare: () => Promise.reject(new Error('offline')) })
  dictation.start()
  await settle()
  assert.equal(states.at(-1), 'idle')
  assert.equal(recorders.length, 0)
  assert.match(feedback.at(-1), /No se pudieron cargar/)
  assert.equal(dictation.start(), true)
  dictation.cancel()
})

test('resamples stereo audio to the 16 kHz mono waveform required by speech recognition', () => {
  const samples = toSpeechSamples({
    length: 48000, sampleRate: 48000, numberOfChannels: 2,
    getChannelData: (index) => new Float32Array(48000).fill(index ? 0 : 0.5),
  })
  assert.equal(samples.length, 16000)
  assert.equal(samples[0], 0.25)
  assert.equal(samples.at(-1), 0.25)
})
