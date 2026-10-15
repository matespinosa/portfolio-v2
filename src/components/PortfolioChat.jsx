import { answerPortfolioConversation } from '../lib/portfolioConversation'
import { useLanguage } from '../lib/useLanguage'
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
import { canAnswerLocally } from '../lib/portfolioAssistant'
import { requestPortfolioAnswer, serializeChatHistory } from '../lib/portfolioChatApi'
import { classifyPortfolioPresentation } from '../lib/portfolioPresentation'
import { useMediaQuery } from '../lib/useMediaQuery'
import { observeChatViewport } from '../lib/chatViewport'
import { createLocalDictation } from '../lib/portfolioLocalDictation'
import { browserSpeech } from '../lib/portfolioSpeechClient'
import { createPortfolioDictation } from '../lib/portfolioDictation'
import { lockScroll } from '../lib/scroll'
import { localizeContent } from '../lib/i18n'
import PortfolioAiOrb from './PortfolioAiOrb'
import PortfolioResponse from './PortfolioResponse'
import PortfolioChatSummary from './PortfolioChatSummary'
import { clearChatSession, loadChatSession, saveChatSession, summarizeChat } from '../lib/portfolioChatSession'

const MOBILE_CHAT_QUERY = '(max-width: 560px)'

const STARTER_SUGGESTIONS = [
  {
    label: 'What does Mateo do?',
    question: 'What does Mateo do?',
  },
  {
    label: 'Financial products',
    question: 'What financial products has Mateo designed?',
  },
  {
    label: 'Frontend practice',
    question: 'How does frontend experience shape Mateo’s design work?',
  },
  {
    label: 'Current role at Rappi',
    question: 'What is Mateo currently building at Rappi?',
  },
]

const STARTER_COPY = {
  kicker: 'MOVE · TYPE · ASK',
  title: 'Get to know Mateo’s work through conversation.',
  body: 'Ask about projects, product decisions, frontend or his current role.',
  placeholder: 'What would you like to know?',
  railNote: 'Ask about projects, product decisions, frontend practice or Mateo’s current role at Rappi.',
  meta: 'Answers based only on this portfolio',
}

// While the chat is open on desktop, the section behind the drawer keeps the chat box in its
// default state; the conversation itself lives only in the drawer.
function ChatDefaultBackdrop() {
  const { t, language } = useLanguage()
  return (
    <div className="portfolio-chat__backdrop" inert aria-hidden="true">
      <div className="portfolio-chat__stage" data-mode="starter" data-expanded="false">
        <aside className="portfolio-chat__rail">
          <div>
            <p className="mono">{t("Portfolio intelligence")}</p>
            <h2>{t("Editorial desk")}</h2>
            <span className="portfolio-chat__rail-state"><i /> {t("Local · Ready")}</span>
          </div>
          <div className="portfolio-chat__rail-conversation">
            <p className="mono">{t("Conversation")}</p>
            <strong>{t("0 questions · 0 answers")}</strong>
            <span>{t("Start a conversation about Mateo’s work.")}</span>
          </div>
          <nav className="portfolio-chat__rail-topics">
            <p className="mono">{t("Exploring")}</p>
            {localizeContent(language, STARTER_SUGGESTIONS).map((suggestion, index) => (
              <button type="button" key={suggestion.label} tabIndex={-1}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {suggestion.label}
              </button>
            ))}
          </nav>
          <div className="portfolio-chat__rail-note">
            <p>{t(STARTER_COPY.railNote)}</p>
            <span className="mono">{t("Ask anything.")}</span>
          </div>
        </aside>
        <div className="portfolio-chat__workspace">
          <header className="portfolio-chat__header">
            <div className="portfolio-chat__identity">
              <img className="portfolio-chat__mark" src="/favicon.svg" alt="" />
              <span className="portfolio-chat__identity-copy">
                <strong>
                  <span className="portfolio-chat__identity-desktop">{t("Mateo portfolio guide")}</span>
                  <span className="portfolio-chat__identity-mobile">{t("Portfolio guide")}</span>
                </strong>
                <small>{t("Answers from this portfolio only")}</small>
              </span>
            </div>
            <div className="portfolio-chat__header-actions">
              <span className="portfolio-chat__state" data-state="ready">
                <i />
                <span className="portfolio-chat__state-label--desktop">{t("Local · Ready")}</span>
                <span className="portfolio-chat__state-label--mobile">{t("Local · Ready")}</span>
              </span>
              <button type="button" className="portfolio-chat__expand" tabIndex={-1}>
                <ArrowsOutSimple size={18} />
              </button>
            </div>
          </header>
          <div className="portfolio-chat__starter">
            <PortfolioAiOrb state="idle" />
            <p className="portfolio-chat__starter-kicker mono">{t(STARTER_COPY.kicker)}</p>
            <h2>{t(STARTER_COPY.title)}</h2>
            <p>{t(STARTER_COPY.body)}</p>
            <div className="portfolio-chat__composer" data-mode="starter">
              <form className="portfolio-chat__form" onSubmit={(event) => event.preventDefault()}>
                <textarea rows="1" readOnly tabIndex={-1} value="" placeholder={t(STARTER_COPY.placeholder)} />
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
                {localizeContent(language, STARTER_SUGGESTIONS).map((suggestion) => (
                  <button type="button" key={suggestion.label} tabIndex={-1}>{suggestion.label}</button>
                ))}
              </div>
              <p className="portfolio-chat__voice-feedback" />
              <footer className="portfolio-chat__meta">{t(STARTER_COPY.meta)}</footer>
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
  const { t, language, locale } = useLanguage()
  const mobileChat = useMediaQuery(MOBILE_CHAT_QUERY)
  const [messages, setMessages] = useState(() => loadChatSession(undefined, language))
  const [draft, setDraft] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [voiceState, setVoiceState] = useState('idle')
  const [voiceFeedback, setVoiceFeedback] = useState('')
  const [assistantStatus, setAssistantStatus] = useState({ label: 'Local · Ready', state: 'ready' })
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
  const summary = useMemo(() => summarizeChat(messages, language), [messages, language])
  const awaitingFirstAnswer = isSending && responseCount === 0
  const isInitial = messages.length === 0 || awaitingFirstAnswer
  const starterLayout = isInitial || showSummary
  const orbState = isSending || voiceState === 'transcribing'
    ? 'thinking'
    : voiceState === 'listening'
      ? 'listening'
      : draft.trim()
        ? 'typing'
        : 'idle'

  const mobileStatusLabel = useMemo(() => {
    const source = assistantStatus.label.startsWith('Gemini') ? 'Gemini' : 'Local'
    if (assistantStatus.state === 'thinking') return `${source} · Thinking`
    if (assistantStatus.state === 'limited') return 'Local · Fallback'
    return `${source} · Ready`
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
    saveChatSession(messages, undefined, language)
  }, [messages, language])

  const resetConversation = useCallback(() => {
    dictationRef.current?.cancel()
    clearChatSession(undefined, language)
    lastScrolledIdRef.current = null
    setMessages([])
    setDraft('')
    setVoiceFeedback('')
    setAssistantStatus({ label: 'Local · Ready', state: 'ready' })
  }, [language])

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
      lang: locale,
      requestMicrophone: navigator.mediaDevices?.getUserMedia
        ? () => navigator.mediaDevices.getUserMedia({ audio: true })
        : undefined,
      createFallback: navigator.mediaDevices?.getUserMedia && window.MediaRecorder && (window.AudioContext || window.webkitAudioContext)
        ? (callbacks) => createLocalDictation({
          ...callbacks,
          mediaDevices: navigator.mediaDevices,
          MediaRecorder: window.MediaRecorder,
          AudioContext: window.AudioContext || window.webkitAudioContext,
          speech: browserSpeech,
        })
        : undefined,
      onDraft: setDraft,
      onState: setVoiceState,
      onFeedback: setVoiceFeedback,
    })
    dictationRef.current = dictation
    return () => {
      dictation.cancel({ notify: false })
      dictationRef.current = null
    }
  }, [locale])

  const toggleVoice = useCallback(() => {
    if (mobileChat) openPanel()
    if (isListening) {
      dictationRef.current?.stop()
      return
    }
    inputRef.current?.blur()
    if (!window.isSecureContext) {
      setVoiceFeedback(t('Open the portfolio over HTTPS to use the microphone, or use your keyboard’s dictation.'))
      return
    }
    dictationRef.current?.start(draft)
  }, [draft, isListening, mobileChat, openPanel, t])

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
    const fallback = answerPortfolioConversation(content, history, { language })
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
      label: answerLocally ? 'Local · Thinking' : 'Gemini · Thinking',
      state: 'thinking',
    })

    let answer
    if (answerLocally) {
      answer = { ...fallback, source: 'local', reason: 'deterministic' }
    } else {
      try {
        answer = await requestPortfolioAnswer({ question: content, history, language })
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
        label: t('Gemini · {count} left today', { count: answer.remaining }),
        state: 'ready',
      })
    } else if (answer.reason?.includes('daily-limit')) {
      setAssistantStatus({ label: 'Local · Daily limit', state: 'limited' })
    } else if (['configuration', 'rate-limit-unavailable'].includes(answer.reason)) {
      setAssistantStatus({ label: 'Local · Setup needed', state: 'limited' })
    } else if (['offline', 'gemini-unavailable'].includes(answer.reason)) {
      setAssistantStatus({ label: 'Local · Offline', state: 'limited' })
    } else {
      setAssistantStatus({ label: 'Local · Ready', state: 'ready' })
    }

    setIsSending(false)
  }, [isSending, messages, mobileChat, openPanel, language, t])

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
          <label className="visually-hidden" htmlFor="portfolio-question"> {t("Ask about Mateo’s work")} </label>
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
                ? t('Keep asking…')
                : starter
                ? t(STARTER_COPY.placeholder)
                : mobileChat
                  ? t('Ask about a case…')
                  : t('Continue the conversation…')
            }
          />
          <div className="portfolio-chat__controls">
            <button
              className="portfolio-chat__voice"
              type="button"
              onClick={toggleVoice}
              aria-label={['starting', 'loading'].includes(voiceState) ? t('Cancel microphone activation') : voiceState === 'transcribing' ? t('Cancel transcription') : isListening ? t('Stop voice dictation') : t('Start voice dictation')}
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
              aria-label={isSending ? t('Preparing answer') : t('Send message')}
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
          <div className="portfolio-chat__suggestions" role="group" aria-label={t("Suggested questions")}>
            {localizeContent(language, STARTER_SUGGESTIONS).map((suggestion) => (
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
            ? t(STARTER_COPY.meta)
            : t('{count} Gemini requests left today · local answers always available', { count: remainingRequests })}
        </footer>
      </div>
    )
  }

  return (
    <section className="portfolio-chat container" id="chat"
      ref={sectionRef}
      style={panelOpen && frozenHeight ? { minHeight: frozenHeight } : undefined}
      aria-label={t("Mateo portfolio guide")}
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
            <span>{responseCount > 0 ? t('Continue conversation') : t('Ask the portfolio')}</span>
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
        data-inspect={t("Local portfolio guide")}
        role={panelOpen ? 'dialog' : undefined}
        aria-modal={panelOpen ? true : undefined}
        aria-label={panelOpen ? t('Portfolio guide') : undefined}
      >
        <aside className="portfolio-chat__rail" aria-label={t("Assistant context")}>
          <div>
            <p className="mono">{t("Portfolio intelligence")}</p>
            <h2>{isInitial ? t('Editorial desk') : t('Mateo portfolio guide')}</h2>
            <span className="portfolio-chat__rail-state">
              <i aria-hidden="true" /> {t(assistantStatus.label)}
            </span>
          </div>

          <div className="portfolio-chat__rail-conversation">
            <p className="mono">{t("Conversation")}</p>
            <strong>
              {questionCount} {questionCount === 1 ? t('question') : t('questions')} · {responseCount}{' '}
              {responseCount === 1 ? t('answer') : t('answers')}
            </strong>
            {questionCount === 0 && <span>{t("Start a conversation about Mateo’s work.")}</span>}
          </div>

          <nav className="portfolio-chat__rail-topics" aria-label={t("Topics to explore")}>
            <p className="mono">{t("Exploring")}</p>
            {localizeContent(language, STARTER_SUGGESTIONS).map((suggestion, index) => (
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
            <p>{t(STARTER_COPY.railNote)}</p>
            <span className="mono">{t("Ask anything.")}</span>
          </div>
        </aside>

        <div className="portfolio-chat__workspace">
          <header className="portfolio-chat__header">
            <div className="portfolio-chat__identity">
              <button
                type="button"
                className="portfolio-chat__mobile-back"
                onClick={closePanel}
                aria-label={t("Back to portfolio")}
              >
                <CaretLeft size={25} weight="regular" aria-hidden="true" />
              </button>
              <img className="portfolio-chat__mark" src="/favicon.svg" alt="" />
              <span className="portfolio-chat__identity-copy">
                <strong>
                  <span className="portfolio-chat__identity-desktop">{t("Mateo portfolio guide")}</span>
                  <span className="portfolio-chat__identity-mobile">{t("Portfolio guide")}</span>
                </strong>
                <small>{t("Answers from this portfolio only")}</small>
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
                <span className="portfolio-chat__state-label--desktop">{t(assistantStatus.label)}</span>
                <span className="portfolio-chat__state-label--mobile">{t(mobileStatusLabel)}</span>
              </span>
              <button
                type="button"
                className="portfolio-chat__expand"
                onClick={() => (panelOpen ? closePanel() : openPanel())}
                aria-controls="portfolio-chat-surface"
                aria-expanded={panelOpen}
                aria-label={panelOpen ? t('Close expanded view') : t('Expand conversation')}
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
                    ? t('CONNECT · ANALYZE · ANSWER')
                    : showSummary
                      ? t('CONVERSATION IN PROGRESS')
                      : t(STARTER_COPY.kicker)}
                </p>
                <h2>
                  {awaitingFirstAnswer
                    ? t('I’m matching your question to the portfolio.')
                    : showSummary
                      ? t('Pick up where you left off.')
                      : t(STARTER_COPY.title)}
                </h2>
                <p>
                  {awaitingFirstAnswer
                    ? t('The orb responds while I prepare an answer based on the published cases.')
                    : showSummary
                      ? t('Ask another question or open the full conversation.')
                      : t(STARTER_COPY.body)}
                </p>
              </Fragment>
            ) : (
              <div
                key="transcript"
                className="portfolio-chat__transcript"
                ref={transcriptRef}
                data-lenis-prevent
                role="log"
                aria-label={t("Conversation with Mateo portfolio guide")}
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
                        <span className="visually-hidden">{t("Mateo portfolio guide:")}</span>
                      )}
                      {message.role === 'user' && <span className="visually-hidden">{t("You:")}</span>}
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
                      <span className="portfolio-chat__message-author">{t("Mateo portfolio guide")}</span>
                      <p role="status">{t("Matching your question to the portfolio…")}</p>
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
