import { PORTFOLIO_LOCALE } from '../data/language.js'

const ERROR_MESSAGES = {
  'not-allowed': 'Allow microphone access in this site’s settings and try again.',
  'service-not-allowed': 'This browser does not allow dictation. Try your keyboard’s microphone.',
  'audio-capture': 'I couldn’t access the microphone. Check that it is available and try again.',
  'no-speech': 'No speech detected. Tap the microphone to try again.',
  network: 'Dictation needs a connection. Check your connection and try again.',
  'language-not-supported': 'English dictation is unavailable. You can use your keyboard’s microphone.',
  aborted: 'Dictation stopped.',
}

const READY_MESSAGE = 'Dictation ready. Review the text and send your question.'

export function createPortfolioDictation({ SpeechRecognition, lang = PORTFOLIO_LOCALE, onDraft, onState, onFeedback }) {
  let active = null

  const release = (session) => {
    if (active !== session) return
    active = null
    const recognition = session.recognition
    recognition.onstart = null
    recognition.onresult = null
    recognition.onerror = null
    recognition.onend = null
    onState('idle')
  }

  const cancel = ({ notify = true } = {}) => {
    if (!active) return
    const session = active
    if (notify) release(session)
    else {
      active = null
      session.recognition.onstart = null
      session.recognition.onresult = null
      session.recognition.onerror = null
      session.recognition.onend = null
    }
    try { session.recognition.abort() } catch { /* Already ended. */ }
    if (notify) onFeedback('')
  }

  return {
    start(draft = '') {
      if (active) return false
      if (!SpeechRecognition) {
        onFeedback('This browser does not support dictation. You can use your keyboard’s microphone.')
        return false
      }

      let session
      try {
        const recognition = new SpeechRecognition()
        session = { recognition, state: 'starting', hasResult: false }
        active = session
        recognition.lang = lang
        recognition.continuous = false
        recognition.interimResults = true
        recognition.maxAlternatives = 1
        recognition.onstart = () => {
          if (active !== session || session.state === 'stopping') return
          session.state = 'listening'
          onState('listening')
          onFeedback('Listening… Tap stop when you’re done.')
        }
        recognition.onresult = (event) => {
          if (active !== session) return
          const transcript = Array.from(event.results)
            .map((result) => result[0]?.transcript?.trim() || '')
            .filter(Boolean)
            .join(' ')
          if (!transcript) return
          session.hasResult = true
          onDraft([draft.trim(), transcript].filter(Boolean).join(' ').slice(0, 1200))
          if (event.results[event.results.length - 1]?.isFinal) onFeedback(READY_MESSAGE)
        }
        recognition.onerror = (event) => {
          if (active !== session) return
          release(session)
          try { recognition.abort() } catch { /* The service may already be closed. */ }
          onFeedback(ERROR_MESSAGES[event.error] || 'I couldn’t complete dictation. Try again or type your question.')
        }
        recognition.onend = () => {
          if (active !== session) return
          release(session)
          onFeedback(session.hasResult ? READY_MESSAGE : ERROR_MESSAGES['no-speech'])
        }
        onState('starting')
        onFeedback('Starting microphone…')
        recognition.start()
        return true
      } catch (error) {
        if (session) cancel()
        const code = error.name === 'NotAllowedError' ? 'not-allowed' : error.name
        onFeedback(ERROR_MESSAGES[code] || 'I couldn’t start the microphone. Try again or use your keyboard’s dictation.')
        return false
      }
    },
    stop() {
      if (!active || active.state === 'stopping') return
      if (active.state === 'starting') {
        cancel()
        onFeedback('Dictation stopped.')
        return
      }
      const session = active
      session.state = 'stopping'
      onState('stopping')
      onFeedback('Finishing dictation…')
      try { session.recognition.stop() } catch {
        cancel()
        onFeedback('Dictation stopped.')
      }
    },
    cancel,
  }
}
