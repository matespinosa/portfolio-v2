import { translate } from './i18n.js'
import { PORTFOLIO_LOCALE } from '../data/language.js'

const PERMISSION_TIMEOUT_MS = 15_000
const START_TIMEOUT_MS = 8_000
const STOP_TIMEOUT_MS = 2_000
const MAX_DICTATION_MS = 60_000

const ERROR_MESSAGES = {
  'not-allowed': 'Allow microphone access in this site’s settings and try again.',
  'service-not-allowed': 'This browser does not allow dictation. Try your keyboard’s microphone.',
  'audio-capture': 'I couldn’t access the microphone. Check that it is available and try again.',
  'no-speech': 'No speech detected. Tap the microphone to try again.',
  network: 'Dictation needs a connection. Check your connection and try again.',
  'language-not-supported': 'Dictation in this language is unavailable. You can use your keyboard’s microphone.',
  aborted: 'Dictation stopped.',
}

let preferLocal = false

const READY_MESSAGE = 'Dictation ready. Review the text and send your question.'
const PERMISSION_TIMEOUT_MESSAGE = 'The browser did not respond to the microphone request. Check the site’s microphone permission, or open this page in Chrome or Safari and try again.'
const START_TIMEOUT_MESSAGE = 'Speech recognition did not start in this browser. Try opening this page in Chrome or Safari, or use your keyboard’s dictation.'

export function createPortfolioDictation({ SpeechRecognition, requestMicrophone, createFallback, lang = PORTFOLIO_LOCALE, onDraft, onState, onFeedback }) {
  const t = (text) => translate(lang.startsWith('es') ? 'es' : 'en', text)
  let active = null
  let fallback
  let fallbackActive = false
  const local = () => {
    fallback ??= createFallback({
      lang, onDraft, onFeedback,
      onState: (state) => { fallbackActive = state !== 'idle'; onState(state) },
    })
    return fallback
  }

  const clearTimer = (session) => {
    clearTimeout(session.timer)
    session.timer = null
  }

  const schedule = (session, callback, delay) => {
    clearTimer(session)
    session.timer = setTimeout(() => {
      if (active === session) callback()
    }, delay)
    // A pending browser callback must not keep a Node test process alive.
    session.timer?.unref?.()
  }

  const release = (session, notify = true) => {
    if (active !== session) return
    active = null
    clearTimer(session)
    const recognition = session.recognition
    recognition.onstart = null
    recognition.onaudiostart = null
    recognition.onresult = null
    recognition.onerror = null
    recognition.onend = null
    if (notify) onState('idle')
  }

  const abort = (session) => {
    try { session.recognition.abort() } catch { /* It may not have started. */ }
  }

  const fail = (session, message) => {
    if (active !== session) return
    release(session)
    abort(session)
    onFeedback(t(message))
  }

  const switchToLocal = (session) => {
    if (!createFallback || active !== session) return false
    release(session, false)
    abort(session)
    preferLocal = true
    local().start(session.draft)
    return true
  }

  const cancel = ({ notify = true } = {}) => {
    if (fallbackActive) {
      fallbackActive = false
      fallback.cancel({ notify })
    }
    if (!active) return
    const session = active
    release(session, notify)
    abort(session)
    if (notify) onFeedback('')
  }

  const stop = () => {
    if (fallbackActive) { fallback.stop(); return }
    if (!active || active.state === 'stopping') return
    const session = active
    if (session.state === 'starting') {
      cancel()
      onFeedback(t(ERROR_MESSAGES.aborted))
      return
    }
    session.state = 'stopping'
    onState('stopping')
    onFeedback(t('Finishing dictation…'))
    // Some engines never emit `end` after stop. Preserve any text already received.
    schedule(session, () => fail(session, session.hasResult ? READY_MESSAGE : ERROR_MESSAGES['no-speech']), STOP_TIMEOUT_MS)
    try { session.recognition.stop() } catch {
      fail(session, session.hasResult ? READY_MESSAGE : ERROR_MESSAGES.aborted)
    }
  }

  return {
    start(draft = '') {
      if (active || fallbackActive) return false
      if (createFallback && (preferLocal || !SpeechRecognition)) return local().start(draft)
      if (!SpeechRecognition) {
        onFeedback(t('This browser does not support dictation. You can use your keyboard’s microphone.'))
        return false
      }

      let session
      try {
        const recognition = new SpeechRecognition()
        session = { recognition, state: 'starting', hasResult: false, timer: null, draft }
        active = session
        recognition.lang = lang
        recognition.continuous = false
        recognition.interimResults = true
        recognition.maxAlternatives = 1
        const listening = () => {
          if (active !== session || session.state !== 'starting') return
          session.state = 'listening'
          onState('listening')
          onFeedback(t('Listening… Tap stop when you’re done.'))
          schedule(session, stop, MAX_DICTATION_MS)
        }
        recognition.onstart = listening
        recognition.onaudiostart = listening
        recognition.onresult = (event) => {
          if (active !== session) return
          // A result is also proof that recognition started, even if `start` was omitted.
          listening()
          const transcript = Array.from(event.results)
            .map((result) => result[0]?.transcript?.trim() || '')
            .filter(Boolean)
            .join(' ')
          if (!transcript) return
          session.hasResult = true
          onDraft([draft.trim(), transcript].filter(Boolean).join(' ').slice(0, 1200))
          if (event.results[event.results.length - 1]?.isFinal) onFeedback(t(READY_MESSAGE))
        }
        recognition.onerror = (event) => {
          if (['network', 'service-not-allowed', 'language-not-supported'].includes(event.error) && !session.hasResult && switchToLocal(session)) return
          fail(session, ERROR_MESSAGES[event.error] || 'I couldn’t complete dictation. Try again or type your question.')
        }
        recognition.onend = () => {
          if (active !== session) return
          release(session)
          onFeedback(t(session.hasResult ? READY_MESSAGE : ERROR_MESSAGES['no-speech']))
        }
        onState('starting')

        const startRecognition = () => {
          if (active !== session) return
          onFeedback(t('Starting microphone…'))
          schedule(session, () => { if (!switchToLocal(session)) fail(session, START_TIMEOUT_MESSAGE) }, START_TIMEOUT_MS)
          try { recognition.start() } catch (error) {
            fail(session, ERROR_MESSAGES[error.name === 'NotAllowedError' ? 'not-allowed' : error.name]
              || 'I couldn’t start the microphone. Try again or use your keyboard’s dictation.')
          }
        }

        if (requestMicrophone) {
          // Request access explicitly: an exposed Web Speech API alone does not prove
          // that an embedded browser can acquire a microphone or show its permission UI.
          onFeedback(t('Allow microphone access to start dictation.'))
          schedule(session, () => fail(session, PERMISSION_TIMEOUT_MESSAGE), PERMISSION_TIMEOUT_MS)
          Promise.resolve(requestMicrophone()).then((stream) => {
            // Always release preflight tracks, including when access arrives after cancellation.
            stream.getTracks().forEach((track) => track.stop())
            startRecognition()
          }).catch((error) => {
            const code = { NotAllowedError: 'not-allowed', SecurityError: 'not-allowed', NotFoundError: 'audio-capture', NotReadableError: 'audio-capture' }[error.name]
            fail(session, ERROR_MESSAGES[code] || 'I couldn’t access the microphone. Check that it is available and try again.')
          })
        } else {
          startRecognition()
        }
        return active === session
      } catch (error) {
        if (session) fail(session, ERROR_MESSAGES[error.name === 'NotAllowedError' ? 'not-allowed' : error.name]
          || 'I couldn’t start the microphone. Try again or use your keyboard’s dictation.')
        else onFeedback(t('I couldn’t start the microphone. Try again or use your keyboard’s dictation.'))
        return false
      }
    },
    stop,
    cancel,
  }
}
