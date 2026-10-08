import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal, flushSync } from 'react-dom'
import {
  ArrowUp,
  ArrowsOutSimple,
  CaretLeft,
  Microphone,
  Sparkle,
  Stop,
  X,
} from '@phosphor-icons/react'
import { answerPortfolioQuestion, canAnswerLocally, mentionedProjectIds } from '../lib/portfolioAssistant'
import { requestPortfolioAnswer, serializeChatHistory } from '../lib/portfolioChatApi'
import { classifyPortfolioPresentation, isPortfolioFollowUp } from '../lib/portfolioPresentation'
import { useMediaQuery } from '../lib/useMediaQuery'
import { observeChatViewport } from '../lib/chatViewport'
import { createPortfolioDictation } from '../lib/portfolioDictation'
import { lockScroll } from '../lib/scroll'
import PortfolioAiOrb from './PortfolioAiOrb'
import PortfolioResponse from './PortfolioResponse'
import PortfolioChatSummary from './PortfolioChatSummary'
import { clearChatSession, loadChatSession, saveChatSession, summarizeChat } from '../lib/portfolioChatSession'

const MOBILE_CHAT_QUERY = '(max-width: 560px)'

const STARTER_SUGGESTIONS = [
  {
    label: '¿Qué hace Mateo?',
    question: '¿Qué hace Mateo?',
  },
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

const STARTER_COPY = {
  kicker: 'MUEVE · ESCRIBE · PREGUNTA',
  title: 'Conoce el trabajo de Mateo conversando.',
  body: 'Pregunta por proyectos, decisiones de producto, frontend o su rol actual.',
  placeholder: '¿Qué te gustaría saber?',
  railNote: 'Pregunta sobre proyectos, decisiones de producto, práctica frontend o el rol actual de Mateo en Rappi.',
  meta: 'Respuestas construidas únicamente con el contenido de este portafolio',
}

// While the chat is open on desktop, the section behind the drawer keeps the chat box in its
// default state; the conversation itself lives only in the drawer.
function ChatDefaultBackdrop() {
  return (
    <div className="portfolio-chat__backdrop" inert aria-hidden="true">
      <div className="portfolio-chat__stage" data-mode="starter" data-expanded="false">
        <aside className="portfolio-chat__rail">
          <div>
            <p className="mono">Portfolio intelligence</p>
            <h2>Mesa editorial</h2>
            <span className="portfolio-chat__rail-state"><i /> Local · Listo</span>
          </div>
          <div className="portfolio-chat__rail-conversation">
            <p className="mono">Conversación</p>
            <strong>0 preguntas · 0 respuestas</strong>
            <span>Empieza una conversación sobre el trabajo de Mateo.</span>
          </div>
          <nav className="portfolio-chat__rail-topics">
            <p className="mono">Explorando</p>
            {STARTER_SUGGESTIONS.map((suggestion, index) => (
              <button type="button" key={suggestion.label} tabIndex={-1}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {suggestion.label}
              </button>
            ))}
          </nav>
          <div className="portfolio-chat__rail-note">
            <p>{STARTER_COPY.railNote}</p>
            <span className="mono">Pregunta lo que quieras.</span>
          </div>
        </aside>
        <div className="portfolio-chat__workspace">
          <header className="portfolio-chat__header">
            <div className="portfolio-chat__identity">
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
              <span className="portfolio-chat__state" data-state="ready">
                <i />
                <span className="portfolio-chat__state-label--desktop">Local · Listo</span>
                <span className="portfolio-chat__state-label--mobile">Local · Activo</span>
              </span>
              <button type="button" className="portfolio-chat__expand" tabIndex={-1}>
                <ArrowsOutSimple size={18} />
              </button>
            </div>
          </header>
          <div className="portfolio-chat__starter">
            <PortfolioAiOrb state="idle" />
            <p className="portfolio-chat__starter-kicker mono">{STARTER_COPY.kicker}</p>
            <h2>{STARTER_COPY.title}</h2>
            <p>{STARTER_COPY.body}</p>
            <div className="portfolio-chat__composer" data-mode="starter">
              <form className="portfolio-chat__form" onSubmit={(event) => event.preventDefault()}>
                <textarea rows="1" readOnly tabIndex={-1} value="" placeholder={STARTER_COPY.placeholder} />
                <div className="portfolio-chat__controls">
                  <button className="portfolio-chat__voice" type="button" tabIndex={-1}>
                    <Microphone size={19} />
                  </button>
                  <button className="portfolio-chat__send" type="button" tabIndex={-1} disabled>
                    <ArrowUp size={19} weight="bold" />
                  </button>
                </div>
              </form>
              <div className="portfolio-chat__suggestions">
                {STARTER_SUGGESTIONS.map((suggestion) => (
                  <button type="button" key={suggestion.label} tabIndex={-1}>{suggestion.label}</button>
                ))}
              </div>
              <p className="portfolio-chat__voice-feedback" />
              <footer className="portfolio-chat__meta">{STARTER_COPY.meta}</footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
}

export default function PortfolioChat({ onOpenProject }) {
  const mobileChat = useMediaQuery(MOBILE_CHAT_QUERY)
  const [messages, setMessages] = useState(loadChatSession)
  const [draft, setDraft] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [voiceState, setVoiceState] = useState('idle')
  const [voiceFeedback, setVoiceFeedback] = useState('')
  const [assistantStatus, setAssistantStatus] = useState({ label: 'Local · Listo', state: 'ready' })
  const [remainingRequests, setRemainingRequests] = useState(null)
  const stageRef = useRef(null)
  const inputRef = useRef(null)
  const transcriptRef = useRef(null)
  const latestAssistantRef = useRef(null)
  const dictationRef = useRef(null)
  const shouldFollowRef = useRef(true)
  const sectionRef = useRef(null)
  const summaryActionRef = useRef(null)
  const wasOpenRef = useRef(false)
  const lastScrolledIdRef = useRef(null)
  const [frozenHeight, setFrozenHeight] = useState(null)
  const [sectionInView, setSectionInView] = useState(true)
  const isListening = voiceState !== 'idle'

  const questionCount = useMemo(
    () => messages.filter((message) => message.role === 'user').length,
    [messages],
  )
  const responseCount = useMemo(
    () => messages.filter((message) => message.role === 'assistant').length,
    [messages],
  )
  // Closed window with a conversation: the chat box keeps its starter layout with a summary under the composer.
  const showSummary = questionCount > 0 && !panelOpen
  const summary = useMemo(() => summarizeChat(messages), [messages])
  const awaitingFirstAnswer = isSending && responseCount === 0
  const isInitial = messages.length === 0 || awaitingFirstAnswer
  const starterLayout = isInitial || showSummary
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

  const openPanel = useCallback(() => {
    if (panelOpen) return
    // Keep the section's height while the stage is lifted into the drawer so the page does not jump.
    setFrozenHeight(sectionRef.current?.offsetHeight || null)
    setPanelOpen(true)
  }, [panelOpen])

  const closePanel = useCallback(() => {
    dictationRef.current?.cancel()
    setVoiceFeedback('')
    setPanelOpen(false)
    inputRef.current?.blur()
  }, [])

  // The conversation survives a reload in this tab, but not a new session.
  useEffect(() => {
    saveChatSession(messages)
  }, [messages])

  const resetConversation = useCallback(() => {
    dictationRef.current?.cancel()
    clearChatSession()
    lastScrolledIdRef.current = null
    setMessages([])
    setDraft('')
    setVoiceFeedback('')
    setAssistantStatus({ label: 'Local · Listo', state: 'ready' })
  }, [])

  // Closing the window hands focus to the summary, unless something else (a case) already took it.
  useEffect(() => {
    if (wasOpenRef.current && !panelOpen) {
      window.requestAnimationFrame(() => {
        const active = document.activeElement
        if (active && active !== document.body && !stageRef.current?.contains(active)) return
        summaryActionRef.current?.focus({ preventScroll: true })
      })
    }
    wasOpenRef.current = panelOpen
  }, [panelOpen])

  useEffect(() => {
    const dictation = createPortfolioDictation({
      SpeechRecognition: window.SpeechRecognition || window.webkitSpeechRecognition,
      lang: navigator.language?.startsWith('es') ? navigator.language : 'es-CO',
      onDraft: setDraft,
      onState: setVoiceState,
      onFeedback: setVoiceFeedback,
    })
    dictationRef.current = dictation
    return () => {
      dictation.cancel({ notify: false })
      dictationRef.current = null
    }
  }, [])

  const toggleVoice = useCallback(() => {
    if (mobileChat) openPanel()
    if (isListening) {
      dictationRef.current?.stop()
      return
    }
    inputRef.current?.blur()
    if (!window.isSecureContext) {
      setVoiceFeedback('Abre el portafolio con HTTPS para usar el micrófono, o usa el dictado de tu teclado.')
      return
    }
    dictationRef.current?.start(draft)
  }, [draft, isListening, mobileChat, openPanel])

  useEffect(() => {
    const latestMessage = messages.at(-1)
    if (latestMessage?.role === 'assistant') {
      // Only react to a new answer; opening or closing the drawer must not move the page.
      if (lastScrolledIdRef.current === latestMessage.id) return
      lastScrolledIdRef.current = latestMessage.id
      window.requestAnimationFrame(() => {
        // A reply arriving while the window is closed must not move the portfolio.
        if (!panelOpen) return
        const transcript = transcriptRef.current
        if (!transcript) return
        transcript.scrollTo({
          top: latestAssistantRef.current
            ? transcript.scrollTop + latestAssistantRef.current.getBoundingClientRect().top
              - transcript.getBoundingClientRect().top
            : transcript.scrollHeight,
          behavior: 'smooth',
        })
      })
      return
    }
    if (!shouldFollowRef.current) return
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, panelOpen, mobileChat])

  useLayoutEffect(() => {
    if (!panelOpen) return
    const transcript = transcriptRef.current
    if (!transcript) return
    transcript.scrollTop = latestAssistantRef.current
      ? latestAssistantRef.current.getBoundingClientRect().top - transcript.getBoundingClientRect().top + transcript.scrollTop
      : transcript.scrollHeight
  }, [panelOpen])

  useEffect(() => {
    const section = sectionRef.current
    if (!section || !('IntersectionObserver' in window)) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => setSectionInView(entry.isIntersecting),
      { threshold: 0.2 },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let focusTimer
    const focusChat = (event) => {
      if (event.detail?.question) setDraft(event.detail.question)
      if (mobileChat) {
        flushSync(openPanel)
        inputRef.current?.focus({ preventScroll: true })
        return
      }
      stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      window.clearTimeout(focusTimer)
      focusTimer = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 420)
    }
    window.addEventListener('portfolio:focus-chat', focusChat)
    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('portfolio:focus-chat', focusChat)
    }
  }, [mobileChat, openPanel])

  useLayoutEffect(() => {
    if (!panelOpen) return undefined
    const scrollY = window.scrollY
    if (mobileChat) document.documentElement.style.setProperty('--chat-page-top', `${-scrollY}px`)
    lockScroll(true)
    const frame = mobileChat
      ? null
      : window.requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }))
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') closePanel()
      if (event.key !== 'Tab') return
      const controls = Array.from(stageRef.current?.querySelectorAll('button:not(:disabled), textarea:not(:disabled), a[href]') || [])
        .filter((element) => element.getClientRects().length > 0)
      const first = controls[0]
      const last = controls.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus({ preventScroll: true })
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus({ preventScroll: true })
      }
    }
    document.documentElement.classList.add('portfolio-chat-expanded')
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      window.removeEventListener('keydown', closeOnEscape)
      document.documentElement.classList.remove('portfolio-chat-expanded')
      if (mobileChat) {
        document.documentElement.style.removeProperty('--chat-page-top')
        window.scrollTo({ top: scrollY, behavior: 'instant' })
      }
      lockScroll(false)
    }
  }, [panelOpen, closePanel, mobileChat])

  // The input is disabled while an answer is being prepared; give it focus back on desktop.
  useEffect(() => {
    if (panelOpen && !mobileChat && !isSending) inputRef.current?.focus({ preventScroll: true })
  }, [panelOpen, mobileChat, isSending])

  useLayoutEffect(() => {
    if (panelOpen && mobileChat && stageRef.current) return observeChatViewport(stageRef.current)
    return undefined
  }, [panelOpen, mobileChat])

  useLayoutEffect(() => {
    const input = inputRef.current
    if (!input) return

    input.style.height = 'auto'
    input.style.height = `${Math.min(input.scrollHeight, 112)}px`
    input.style.overflowY = input.scrollHeight > 112 ? 'auto' : 'hidden'
  }, [draft, starterLayout, panelOpen, mobileChat])

  const ask = useCallback(async (question) => {
    const content = question.trim()
    if (!content || isSending) return

    dictationRef.current?.cancel()
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
    const answerLocally = canAnswerLocally({ history, localAnswer: fallback })
    const userMessage = { id: makeId(), role: 'user', content, createdAt: Date.now() }

    shouldFollowRef.current = true
    openPanel()
    if (mobileChat) inputRef.current?.blur()
    setMessages((current) => [...current, userMessage])
    setDraft('')
    setVoiceFeedback('')
    setIsSending(true)
    setAssistantStatus({
      label: answerLocally ? 'Local · Pensando' : 'Gemini · Pensando',
      state: 'thinking',
    })

    let answer
    if (answerLocally) {
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
        label: `Gemini · ${answer.remaining} restantes hoy`,
        state: 'ready',
      })
    } else if (answer.reason?.includes('daily-limit')) {
      setAssistantStatus({ label: 'Local · Límite diario', state: 'limited' })
    } else if (['configuration', 'rate-limit-unavailable'].includes(answer.reason)) {
      setAssistantStatus({ label: 'Local · Configuración pendiente', state: 'limited' })
    } else if (['offline', 'gemini-unavailable'].includes(answer.reason)) {
      setAssistantStatus({ label: 'Local · Sin conexión', state: 'limited' })
    } else {
      setAssistantStatus({ label: 'Local · Listo', state: 'ready' })
    }

    setIsSending(false)
  }, [isSending, messages, mobileChat, openPanel])

  const renderComposer = (mode) => {
    const starter = mode === 'starter'

    return (
      <div key="composer" className="portfolio-chat__composer" data-mode={mode}>
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
            enterKeyHint="send"
            autoCapitalize="sentences"
            aria-describedby={voiceFeedback ? 'portfolio-voice-feedback' : undefined}
            onPointerDown={() => {
              // Make the input fixed before the browser positions the keyboard.
              if (mobileChat && !panelOpen) flushSync(openPanel)
            }}
            onFocus={() => {
              if (mobileChat) openPanel()
            }}
            onChange={(event) => {
              dictationRef.current?.cancel()
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
              starter && showSummary
                ? 'Sigue preguntando…'
                : starter
                ? STARTER_COPY.placeholder
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
              aria-label={voiceState === 'starting' ? 'Cancelar activación del micrófono' : isListening ? 'Detener dictado por voz' : 'Iniciar dictado por voz'}
              aria-pressed={isListening}
              disabled={isSending || voiceState === 'stopping'}
              data-listening={isListening ? 'true' : 'false'}
            >
              {isListening
                ? <Stop size={17} weight="fill" aria-hidden="true" />
                : <Microphone size={19} aria-hidden="true" />}
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

        {starter && showSummary && (
          <PortfolioChatSummary
            summary={summary}
            isSending={isSending}
            actionRef={summaryActionRef}
            onContinue={() => {
              // Opening synchronously keeps the phone keyboard inside the tap that triggered it.
              flushSync(openPanel)
              inputRef.current?.focus({ preventScroll: true })
            }}
            onReset={resetConversation}
          />
        )}

        {starter && !showSummary && (
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

        <p id="portfolio-voice-feedback" className="portfolio-chat__voice-feedback" role="status" aria-live="polite" aria-atomic="true">
          {voiceFeedback}
        </p>
        <footer className="portfolio-chat__meta">
          {remainingRequests === null
            ? STARTER_COPY.meta
            : `${remainingRequests} consultas de Gemini disponibles hoy · respaldo local siempre activo`}
        </footer>
      </div>
    )
  }

  return (
    <section className="portfolio-chat container" id="chat"
      ref={sectionRef}
      style={panelOpen && frozenHeight ? { minHeight: frozenHeight } : undefined}
      aria-label="Mateo portfolio guide"
    >
      {/* Phones cover the page completely, so only desktop needs the backdrop. */}
      {panelOpen && !mobileChat && <ChatDefaultBackdrop />}
      {/* Inside the section so it stacks above the backdrop but below the drawer. */}
      {panelOpen && <div className="portfolio-chat__scrim" onClick={closePanel} aria-hidden="true" />}
      {createPortal(
        <>
          <button
            type="button"
            className="portfolio-chat__launcher"
            data-visible={!panelOpen && !sectionInView ? 'true' : 'false'}
            onClick={openPanel}
            aria-controls="portfolio-chat-surface"
            aria-expanded={panelOpen}
            tabIndex={!panelOpen && !sectionInView ? 0 : -1}
          >
            <Sparkle size={16} weight="fill" aria-hidden="true" />
            <span>{responseCount > 0 ? 'Seguir conversación' : 'Pregúntale al portafolio'}</span>
            {responseCount > 0 && <span className="portfolio-chat__launcher-count">{responseCount}</span>}
          </button>
        </>,
        document.body,
      )}
      <div
        className="portfolio-chat__stage"
        ref={stageRef}
        id="portfolio-chat-surface"
        data-mode={starterLayout ? 'starter' : 'conversation'}
        data-expanded={panelOpen ? 'true' : 'false'}
        data-inspect="Local portfolio guide"
        role={panelOpen ? 'dialog' : undefined}
        aria-modal={panelOpen ? true : undefined}
        aria-label={panelOpen ? 'Guía del portafolio' : undefined}
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
            <p className="mono">Conversación</p>
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
            <p>{STARTER_COPY.railNote}</p>
            <span className="mono">Pregunta lo que quieras.</span>
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
                onClick={() => (panelOpen ? closePanel() : openPanel())}
                aria-controls="portfolio-chat-surface"
                aria-expanded={panelOpen}
                aria-label={panelOpen ? 'Cerrar vista ampliada' : 'Ampliar conversación'}
              >
                {panelOpen ? <X size={18} aria-hidden="true" /> : <ArrowsOutSimple size={18} aria-hidden="true" />}
              </button>
            </div>
          </header>

          <div
            className={starterLayout ? 'portfolio-chat__starter' : 'portfolio-chat__conversation'}
            data-lenis-prevent={panelOpen ? '' : undefined}
          >
            {starterLayout ? (
              <Fragment key="intro">
                <PortfolioAiOrb state={orbState} />
                <p className="portfolio-chat__starter-kicker mono">
                  {awaitingFirstAnswer
                    ? 'CONECTA · ANALIZA · RESPONDE'
                    : showSummary
                      ? 'CONVERSACIÓN EN CURSO'
                      : STARTER_COPY.kicker}
                </p>
                <h2>
                  {awaitingFirstAnswer
                    ? 'Estoy conectando tu pregunta con el portafolio.'
                    : showSummary
                      ? 'Retoma la conversación donde la dejaste.'
                      : STARTER_COPY.title}
                </h2>
                <p>
                  {awaitingFirstAnswer
                    ? 'La figura reacciona mientras preparo una respuesta basada en los casos publicados.'
                    : showSummary
                      ? 'Escribe otra pregunta o abre la conversación completa.'
                      : STARTER_COPY.body}
                </p>
              </Fragment>
            ) : (
              <div
                key="transcript"
                className="portfolio-chat__transcript"
                ref={transcriptRef}
                data-lenis-prevent
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
                          onOpenProject={(project) => {
                            closePanel()
                            onOpenProject(project)
                          }}
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
            )}
            {renderComposer(starterLayout ? 'starter' : 'conversation')}
          </div>
        </div>
      </div>
    </section>
  )
}
