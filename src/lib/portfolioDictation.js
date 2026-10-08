const ERROR_MESSAGES = {
  'not-allowed': 'Permite el micrófono en los ajustes de este sitio y vuelve a intentarlo.',
  'service-not-allowed': 'El navegador no permite el dictado. Prueba el micrófono de tu teclado.',
  'audio-capture': 'No pude acceder al micrófono. Comprueba que esté disponible e inténtalo de nuevo.',
  'no-speech': 'No detecté voz. Toca el micrófono para intentarlo de nuevo.',
  network: 'El dictado necesita conexión. Comprueba tu conexión e inténtalo de nuevo.',
  'language-not-supported': 'El dictado en español no está disponible. Puedes usar el micrófono de tu teclado.',
  aborted: 'Dictado detenido.',
}

const READY_MESSAGE = 'Dictado listo. Revisa el texto y envía tu pregunta.'

export function createPortfolioDictation({ SpeechRecognition, lang = 'es-CO', onDraft, onState, onFeedback }) {
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
        onFeedback('Este navegador no ofrece dictado. Puedes usar el micrófono de tu teclado.')
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
          onFeedback('Escuchando… Toca detener cuando termines.')
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
          onFeedback(ERROR_MESSAGES[event.error] || 'No pude completar el dictado. Inténtalo de nuevo o escribe tu pregunta.')
        }
        recognition.onend = () => {
          if (active !== session) return
          release(session)
          onFeedback(session.hasResult ? READY_MESSAGE : ERROR_MESSAGES['no-speech'])
        }
        onState('starting')
        onFeedback('Activando micrófono…')
        recognition.start()
        return true
      } catch (error) {
        if (session) cancel()
        const code = error.name === 'NotAllowedError' ? 'not-allowed' : error.name
        onFeedback(ERROR_MESSAGES[code] || 'No pude activar el micrófono. Inténtalo de nuevo o usa el dictado de tu teclado.')
        return false
      }
    },
    stop() {
      if (!active || active.state === 'stopping') return
      if (active.state === 'starting') {
        cancel()
        onFeedback('Dictado detenido.')
        return
      }
      const session = active
      session.state = 'stopping'
      onState('stopping')
      onFeedback('Terminando dictado…')
      try { session.recognition.stop() } catch {
        cancel()
        onFeedback('Dictado detenido.')
      }
    },
    cancel,
  }
}
