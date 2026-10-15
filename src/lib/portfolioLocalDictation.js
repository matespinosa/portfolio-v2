import { translate } from './i18n.js'

const READY = 'Dictation ready. Review the text and send your question.'
const STOPPED = 'Dictation stopped.'
const SILENCE = 'No speech detected. Tap the microphone to try again.'

export function toSpeechSamples(buffer) {
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) => buffer.getChannelData(index))
  const length = Math.round(buffer.length * 16000 / buffer.sampleRate)
  const samples = new Float32Array(length)
  for (let i = 0; i < length; i++) {
    const position = i * buffer.sampleRate / 16000
    const left = Math.min(Math.floor(position), buffer.length - 1)
    const right = Math.min(left + 1, buffer.length - 1)
    const fraction = position - left
    for (const channel of channels) samples[i] += (channel[left] * (1 - fraction) + channel[right] * fraction) / channels.length
  }
  return samples
}

export function createLocalDictation({ mediaDevices, MediaRecorder, AudioContext, speech, lang, onDraft, onState, onFeedback }) {
  const language = lang.startsWith('es') ? 'es' : 'en'
  const t = (text) => translate(language, text)
  let active

  const releaseStream = (session) => session.stream?.getTracks().forEach((track) => track.stop())
  const clearTimers = (session) => {
    clearTimeout(session.timer)
    clearTimeout(session.captureTimer)
  }
  const release = (session, notify = true) => {
    if (active !== session) return
    active = null
    clearTimers(session)
    if (session.recorder) {
      session.recorder.ondataavailable = null
      session.recorder.onstop = null
      session.recorder.onerror = null
      if (session.recorder.state !== 'inactive') {
        try { session.recorder.stop() } catch { /* The capture may already be closed. */ }
      }
    }
    releaseStream(session)
    session.context?.close().catch(() => {})
    if (notify) onState('idle')
  }
  const finish = (session, text) => {
    if (active !== session) return
    release(session)
    onFeedback(t(text))
  }

  const transcribe = async (session) => {
    if (active !== session) return
    clearTimers(session)
    releaseStream(session)
    session.state = 'transcribing'
    onState('transcribing')
    onFeedback(t('Transcribing on your device…'))
    session.timer = setTimeout(() => finish(session, 'Transcription took too long. Tap the microphone to try again.'), 60_000)
    try {
      const blob = new Blob(session.chunks, { type: session.recorder.mimeType })
      if (!blob.size) { finish(session, SILENCE); return }
      const bytes = await blob.arrayBuffer()
      if (active !== session) return
      session.context = new AudioContext()
      const buffer = await session.context.decodeAudioData(bytes)
      if (active !== session) return
      const audio = toSpeechSamples(buffer)
      // Avoid hallucinated text from silent recordings.
      const energy = audio.reduce((sum, value) => sum + value * value, 0) / (audio.length || 1)
      if (audio.length < 1600 || energy < 0.000004) { finish(session, SILENCE); return }
      const text = await speech.transcribe(audio, language)
      if (active !== session) return
      if (text.trim()) onDraft([session.draft.trim(), text.trim()].filter(Boolean).join(' ').slice(0, 1200))
      finish(session, text.trim() ? READY : SILENCE)
    } catch {
      finish(session, 'I couldn’t transcribe the recording. Tap the microphone to try again.')
    }
  }

  const stop = () => {
    if (!active) return
    const session = active
    if (session.state !== 'listening') {
      finish(session, STOPPED)
      return
    }
    session.state = 'stopping'
    clearTimers(session)
    onState('stopping')
    onFeedback(t('Finishing dictation…'))
    session.timer = setTimeout(() => finish(session, 'I couldn’t complete dictation. Try again or type your question.'), 3000)
    try { session.recorder.stop() } catch { finish(session, STOPPED) }
    releaseStream(session)
  }

  return {
    start(draft = '') {
      if (active) return false
      const session = { draft, state: 'loading', chunks: [] }
      active = session
      onState('loading')
      onFeedback(t('Preparing on-device dictation. The first use downloads speech files; your audio stays on this device.'))
      session.timer = setTimeout(() => finish(session, 'Voice setup took too long. Check your connection and tap the microphone to retry.'), 120_000)
      // Prepare before opening the mic so speech is never recorded during a model download.
      Promise.resolve().then(() => speech.prepare()).then(async () => {
        if (active !== session) return
        clearTimers(session)
        session.state = 'starting'
        onState('starting')
        onFeedback(t('Allow microphone access to start dictation.'))
        session.timer = setTimeout(() => finish(session, 'The browser did not respond to the microphone request. Check the site’s microphone permission, or open this page in Chrome or Safari and try again.'), 15_000)
        const stream = await mediaDevices.getUserMedia({ audio: true })
        if (active !== session) { stream.getTracks().forEach((track) => track.stop()); return }
        session.stream = stream
        const recorder = session.recorder = new MediaRecorder(stream)
        recorder.ondataavailable = ({ data }) => { if (active === session && data.size) session.chunks.push(data) }
        recorder.onstop = () => transcribe(session)
        recorder.onerror = () => finish(session, 'I couldn’t access the microphone. Check that it is available and try again.')
        recorder.start()
        clearTimers(session)
        session.state = 'listening'
        onState('listening')
        onFeedback(t('Listening on your device… Speak, then tap stop to transcribe.'))
        session.captureTimer = setTimeout(stop, 30_000)
      }).catch((error) => {
        finish(session, error.name === 'NotAllowedError'
          ? 'Allow microphone access in this site’s settings and try again.'
          : session.state === 'loading'
            ? 'Speech files could not be loaded. Check your connection and try again.'
            : 'I couldn’t access the microphone. Check that it is available and try again.')
      })
      return true
    },
    stop,
    cancel({ notify = true } = {}) {
      if (!active) return
      release(active, notify)
      if (notify) onFeedback('')
    },
  }
}
