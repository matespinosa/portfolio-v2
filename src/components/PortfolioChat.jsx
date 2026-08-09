import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowUp,
  ArrowsOutSimple,
  CaretLeft,
  Microphone,
  Sparkle,
  X,
} from '@phosphor-icons/react'
import { answerPortfolioQuestion, mentionedProjectIds } from '../lib/portfolioAssistant'
import { requestPortfolioAnswer, serializeChatHistory } from '../lib/portfolioChatApi'
import { classifyPortfolioPresentation, isPortfolioFollowUp } from '../lib/portfolioPresentation'
import { useMediaQuery } from '../lib/useMediaQuery'
import PortfolioAiOrb from './PortfolioAiOrb'
import PortfolioResponse from './PortfolioResponse'

const MOBILE_CHAT_QUERY = '(max-width: 560px)'

const STARTER_SUGGESTIONS = [
  {
    label: 'Productos financieros',
    question: '¿Qué productos financieros ha diseñado Mateo?',
  },
  {
    label: 'Práctica frontend',
    question: '¿Cómo influye la experiencia frontend de Mateo en su trabajo de diseño?',
  },
  {
    label: 'Rol actual en Rappi',
    question: '¿En qué está trabajando Mateo actualmente en Rappi?',
  },
]

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
}

function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition
}

export default function PortfolioChat({ onOpenProject }) {
  const mobileChat = useMediaQuery(MOBILE_CHAT_QUERY)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceFeedback, setVoiceFeedback] = useState('')
  const [assistantStatus, setAssistantStatus] = useState({ label: 'Local · Ready', state: 'ready' })
  const [remainingRequests, setRemainingRequests] = useState(null)
  const stageRef = useRef(null)
  const inputRef = useRef(null)
  const transcriptRef = useRef(null)
  const latestAssistantRef = useRef(null)
  const recognitionRef = useRef(null)
  const shouldFollowRef = useRef(true)

  const questionCount = useMemo(
    () => messages.filter((message) => message.role === 'user').length,
    [messages],
  )
  const responseCount = useMemo(
    () => messages.filter((message) => message.role === 'assistant').length,
    [messages],
  )
  const awaitingFirstAnswer = isSending && responseCount === 0
  const isInitial = messages.length === 0 || awaitingFirstAnswer
  const orbState = isSending
    ? 'thinking'
    : isListening
      ? 'listening'
      : draft.trim()
        ? 'typing'
        : 'idle'

  const mobileStatusLabel = useMemo(() => {
    const source = assistantStatus.label.startsWith('Gemini') ? 'Gemini' : 'Local'
    if (assistantStatus.state === 'thinking') return `${source} · Pensando`
    if (assistantStatus.state === 'limited') return 'Local · Respaldo'
    return `${source} · Activo`
  }, [assistantStatus])

  const closePanel = useCallback(() => {
    setPanelOpen(false)
    inputRef.current?.blur()
  }, [])

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const toggleVoice = useCallback(() => {
    if (isListening) {
      stopVoice()
      return
    }

    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) {
      setVoiceFeedback('El dictado por voz no está disponible en este navegador.')
      return
    }

    const recognition = new SpeechRecognition()
    const startingDraft = draft.trim()
    recognition.lang = navigator.language?.startsWith('es') ? navigator.language : 'es-CO'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.onstart = () => {
      setIsListening(true)
      setVoiceFeedback('Escuchando…')
    }
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join('')
        .trim()
      setDraft([startingDraft, transcript].filter(Boolean).join(' '))
      setVoiceFeedback(event.results[event.results.length - 1]?.isFinal ? 'Dictado listo.' : 'Escuchando…')
    }
    recognition.onerror = (event) => {
      if (!['aborted', 'no-speech'].includes(event.error)) {
        setVoiceFeedback('No pude activar el micrófono. Puedes seguir escribiendo.')
      } else if (event.error === 'no-speech') {
        setVoiceFeedback('No detecté voz. Inténtalo de nuevo cuando quieras.')
      }
    }
    recognition.onend = () => {
      recognitionRef.current = null
      setIsListening(false)
    }

    recognitionRef.current = recognition
    setVoiceFeedback('Activando micrófono…')
    recognition.start()
  }, [draft, isListening, stopVoice])

  useEffect(() => {
    const latestMessage = messages.at(-1)
    if (latestMessage?.role === 'assistant') {
      window.requestAnimationFrame(() => {
        const assistantMessages = messages.filter((message) => message.role === 'assistant')
        if (panelOpen) {
          const transcript = transcriptRef.current
          if (transcript) {
            transcript.scrollTo({
              top: latestAssistantRef.current?.offsetTop || transcript.scrollHeight,
              behavior: 'smooth',
            })
          }
        } else if (assistantMessages.length === 1) {
          stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          latestAssistantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
      return
    }
    if (!shouldFollowRef.current) return
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, panelOpen])

  useEffect(() => {
    const focusChat = (event) => {
      if (event.detail?.question) setDraft(event.detail.question)
      stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      window.setTimeout(() => inputRef.current?.focus(), 420)
    }
    window.addEventListener('portfolio:focus-chat', focusChat)
    return () => window.removeEventListener('portfolio:focus-chat', focusChat)
  }, [])

  useEffect(() => {
    if (!panelOpen) return undefined
    const frame = mobileChat
      ? null
      : window.requestAnimationFrame(() => inputRef.current?.focus())
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') closePanel()
    }
    document.documentElement.classList.add('portfolio-chat-expanded')
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      window.removeEventListener('keydown', closeOnEscape)
      document.documentElement.classList.remove('portfolio-chat-expanded')
    }
  }, [panelOpen, closePanel, mobileChat])

  useEffect(() => {
    const input = inputRef.current
    if (!input) return

    input.style.height = 'auto'
    input.style.height = `${Math.min(input.scrollHeight, 112)}px`
    input.style.overflowY = input.scrollHeight > 112 ? 'auto' : 'hidden'
  }, [draft, isInitial])

  useEffect(
    () => () => {
      recognitionRef.current?.abort()
      document.documentElement.classList.remove('portfolio-chat-expanded')
    },
    [],
  )

  const ask = useCallback(async (question) => {
    const content = question.trim()
    if (!content || isSending) return

    recognitionRef.current?.stop()
    const history = serializeChatHistory(messages)
    const initialFallback = answerPortfolioQuestion(content)
    const latestContextIds = [...history]
      .reverse()
      .find((message) => message.projectIds?.some((projectId) => projectId !== 'rappi'))
      ?.projectIds.filter((projectId) => projectId !== 'rappi') || []
    const shouldInheritContext =
      isPortfolioFollowUp(content) &&
      mentionedProjectIds(content).length === 0 &&
      !initialFallback.projectIds.includes('rappi') &&
      latestContextIds.length > 0
    const fallback = shouldInheritContext
      ? answerPortfolioQuestion(content, { projectIds: latestContextIds })
      : initialFallback
    const canAnswerLocally = history.length === 0 && fallback.confidence === 'high'
    const userMessage = { id: makeId(), role: 'user', content, createdAt: Date.now() }

    shouldFollowRef.current = true
    if (mobileChat) {
      setPanelOpen(true)
      inputRef.current?.blur()
    }
    setMessages((current) => [...current, userMessage])
    setDraft('')
    setVoiceFeedback('')
    setIsSending(true)
    setAssistantStatus({
      label: canAnswerLocally ? 'Local · Thinking' : 'Gemini · Thinking',
      state: 'thinking',
    })

    let answer
    if (canAnswerLocally) {
      answer = { ...fallback, source: 'local', reason: 'deterministic' }
    } else {
      try {
        answer = await requestPortfolioAnswer({ question: content, history })
      } catch {
        answer = { ...fallback, source: 'local', reason: 'offline' }
      }
    }

    const assistantMessage = {
      id: makeId(),
      role: 'assistant',
      content: answer.text,
      confidence: answer.confidence,
      language: answer.language,
      projectIds: answer.projectIds,
      suggestions: answer.suggestions,
      presentation: classifyPortfolioPresentation({ question: content, answer }),
      createdAt: Date.now(),
    }

    setMessages((current) => [...current, assistantMessage])
    if (Number.isInteger(answer.remaining)) setRemainingRequests(answer.remaining)

    if (answer.source === 'gemini') {
      setAssistantStatus({
        label: `Gemini · ${answer.remaining} left today`,
        state: 'ready',
      })
    } else if (answer.reason?.includes('daily-limit')) {
      setAssistantStatus({ label: 'Local · Daily limit', state: 'limited' })
    } else if (['configuration', 'rate-limit-unavailable'].includes(answer.reason)) {
      setAssistantStatus({ label: 'Local · Setup incomplete', state: 'limited' })
    } else if (['offline', 'gemini-unavailable'].includes(answer.reason)) {
      setAssistantStatus({ label: 'Local · Offline', state: 'limited' })
    } else {
      setAssistantStatus({ label: 'Local · Ready', state: 'ready' })
    }

    setIsSending(false)
  }, [isSending, messages, mobileChat])

  const renderComposer = (mode) => {
    const starter = mode === 'starter'

    return (
      <div className="portfolio-chat__composer" data-mode={mode}>
        <form
          className="portfolio-chat__form"
          onSubmit={(event) => {
            event.preventDefault()
            ask(draft)
          }}
        >
          <label className="visually-hidden" htmlFor="portfolio-question">
            Pregunta sobre el trabajo de Mateo
          </label>
          <textarea
            id="portfolio-question"
            ref={inputRef}
            rows="1"
            maxLength="1200"
            value={draft}
            disabled={isSending}
            onChange={(event) => {
              setDraft(event.target.value)
              if (voiceFeedback) setVoiceFeedback('')
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault()
                ask(draft)
              }
            }}
            placeholder={
              starter
                ? '¿Qué te gustaría saber?'
                : mobileChat
                  ? 'Pregúntame sobre un caso…'
                  : 'Continúa la conversación…'
            }
          />
          <div className="portfolio-chat__controls">
            <button
              className="portfolio-chat__voice"
              type="button"
              onClick={toggleVoice}
              aria-label={isListening ? 'Detener dictado por voz' : 'Iniciar dictado por voz'}
              aria-pressed={isListening}
              disabled={isSending}
              data-listening={isListening ? 'true' : 'false'}
            >
              <Microphone size={19} weight={isListening ? 'fill' : 'regular'} aria-hidden="true" />
            </button>
            <button
              className="portfolio-chat__send"
              type="submit"
              aria-label={isSending ? 'Generando respuesta' : 'Enviar mensaje'}
              disabled={isSending || !draft.trim()}
            >
              <ArrowUp size={19} weight="bold" aria-hidden="true" />
            </button>
          </div>
        </form>

        {starter && (
          <div className="portfolio-chat__suggestions" role="group" aria-label="Preguntas sugeridas">
            {STARTER_SUGGESTIONS.map((suggestion) => (
              <button
                type="button"
                key={suggestion.label}
                onClick={() => ask(suggestion.question)}
                disabled={isSending}
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        )}

        <p className="portfolio-chat__voice-feedback" role="status" aria-live="polite">
          {voiceFeedback}
        </p>
        <footer className="portfolio-chat__meta">
          {remainingRequests === null
            ? 'Respuestas construidas únicamente con el contenido de este portafolio'
            : `${remainingRequests} consultas de Gemini disponibles hoy · respaldo local siempre activo`}
        </footer>
      </div>
    )
  }

  return (
    <section className="portfolio-chat container" id="chat" aria-label="Mateo portfolio guide">
      <div
        className="portfolio-chat__stage"
        ref={stageRef}
        id="portfolio-chat-surface"
        data-mode={isInitial ? 'starter' : 'conversation'}
        data-expanded={panelOpen ? 'true' : 'false'}
        data-inspect="Local portfolio guide"
      >
        <aside className="portfolio-chat__rail" aria-label="Contexto del asistente">
          <div>
            <p className="mono">Portfolio intelligence</p>
            <h2>{isInitial ? 'Mesa editorial' : 'Mateo portfolio guide'}</h2>
            <span className="portfolio-chat__rail-state">
              <i aria-hidden="true" /> {assistantStatus.label}
            </span>
          </div>

          <div className="portfolio-chat__rail-conversation">
            <p className="mono">Conversation</p>
            <strong>
              {questionCount} {questionCount === 1 ? 'pregunta' : 'preguntas'} · {responseCount}{' '}
              {responseCount === 1 ? 'respuesta' : 'respuestas'}
            </strong>
            {questionCount === 0 && <span>Empieza una conversación sobre el trabajo de Mateo.</span>}
          </div>

          <nav className="portfolio-chat__rail-topics" aria-label="Temas para explorar">
            <p className="mono">Explorando</p>
            {STARTER_SUGGESTIONS.map((suggestion, index) => (
              <button
                type="button"
                key={suggestion.label}
                onClick={() => ask(suggestion.question)}
                disabled={isSending}
              >
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                {suggestion.label}
              </button>
            ))}
          </nav>

          <div className="portfolio-chat__rail-note">
            <p>Pregunta sobre proyectos, decisiones de producto, práctica frontend o el rol actual de Mateo en Rappi.</p>
            <span className="mono">Ask anything.</span>
          </div>
        </aside>

        <div className="portfolio-chat__workspace">
          <header className="portfolio-chat__header">
            <div className="portfolio-chat__identity">
              <button
                type="button"
                className="portfolio-chat__mobile-back"
                onClick={closePanel}
                aria-label="Volver al portafolio"
              >
                <CaretLeft size={25} weight="regular" aria-hidden="true" />
              </button>
              <img className="portfolio-chat__mark" src="/favicon.svg" alt="" />
              <span className="portfolio-chat__identity-copy">
                <strong>
                  <span className="portfolio-chat__identity-desktop">Mateo portfolio guide</span>
                  <span className="portfolio-chat__identity-mobile">Portfolio guide</span>
                </strong>
                <small>Answers from this portfolio only</small>
              </span>
            </div>
            <div className="portfolio-chat__header-actions">
              <span
                className="portfolio-chat__state"
                data-state={assistantStatus.state}
                role="status"
                aria-atomic="true"
              >
                <i aria-hidden="true" />
                <span className="portfolio-chat__state-label--desktop">{assistantStatus.label}</span>
                <span className="portfolio-chat__state-label--mobile">{mobileStatusLabel}</span>
              </span>
              <button
                type="button"
                className="portfolio-chat__expand"
                onClick={() => setPanelOpen((open) => !open)}
                aria-controls="portfolio-chat-surface"
                aria-expanded={panelOpen}
                aria-label={panelOpen ? 'Cerrar vista ampliada' : 'Ampliar conversación'}
              >
                {panelOpen ? <X size={18} aria-hidden="true" /> : <ArrowsOutSimple size={18} aria-hidden="true" />}
              </button>
            </div>
          </header>

          {isInitial ? (
            <div className="portfolio-chat__starter">
              <PortfolioAiOrb state={orbState} />
              <p className="portfolio-chat__starter-kicker mono">
                {awaitingFirstAnswer ? 'CONECTA · ANALIZA · RESPONDE' : 'MUEVE · ESCRIBE · PREGUNTA'}
              </p>
              <h2>
                {awaitingFirstAnswer
                  ? 'Estoy conectando tu pregunta con el portafolio.'
                  : 'Conoce el trabajo de Mateo conversando.'}
              </h2>
              <p>
                {awaitingFirstAnswer
                  ? 'La figura reacciona mientras preparo una respuesta basada en los casos publicados.'
                  : 'Pregunta por proyectos, decisiones de producto, frontend o su rol actual.'}
              </p>
              {renderComposer('starter')}
            </div>
          ) : (
            <>
              <div
                className="portfolio-chat__transcript"
                ref={transcriptRef}
                role="log"
                aria-label="Conversación con Mateo portfolio guide"
                aria-live="polite"
                onScroll={(event) => {
                  const transcript = event.currentTarget
                  const distanceFromBottom =
                    transcript.scrollHeight - transcript.scrollTop - transcript.clientHeight
                  shouldFollowRef.current = distanceFromBottom < 48
                }}
              >
                {messages.map((message, index) => (
                  <article
                    className="portfolio-chat__message"
                    data-role={message.role}
                    data-kind={message.presentation?.kind}
                    key={message.id}
                    ref={
                      message.role === 'assistant' && index === messages.length - 1
                        ? latestAssistantRef
                        : undefined
                    }
                  >
                    {message.role === 'assistant' && (
                      <span className="portfolio-chat__avatar" aria-hidden="true">
                        <Sparkle size={17} weight="fill" />
                      </span>
                    )}
                    <div className="portfolio-chat__message-content">
                      {message.role === 'assistant' && (
                        <span className="visually-hidden">Mateo portfolio guide:</span>
                      )}
                      {message.role === 'user' && <span className="visually-hidden">Tú:</span>}
                      {message.role === 'assistant' ? (
                        <PortfolioResponse
                          message={message}
                          onAsk={ask}
                          onOpenProject={onOpenProject}
                          isSending={isSending}
                        />
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>
                  </article>
                ))}
                {isSending && (
                  <article
                    className="portfolio-chat__message portfolio-chat__message--pending"
                    data-role="assistant"
                  >
                    <span className="portfolio-chat__avatar" aria-hidden="true">
                      <Sparkle size={17} weight="fill" />
                    </span>
                    <div className="portfolio-chat__message-content">
                      <span className="portfolio-chat__message-author">Mateo portfolio guide</span>
                      <p role="status">Conectando la pregunta con el contexto del portafolio…</p>
                    </div>
                  </article>
                )}
              </div>

              {renderComposer('conversation')}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
