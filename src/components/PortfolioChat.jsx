import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { chatSuggestions } from '../data/profile'
import { projects } from '../data/projects'
import { answerPortfolioQuestion } from '../lib/portfolioAssistant'

const SUGGESTION_LABELS = ['Fintech products', 'Frontend practice', 'Current role at Rappi']

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
}

export default function PortfolioChat({ onOpenProject }) {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const inputRef = useRef(null)
  const transcriptRef = useRef(null)
  const launcherRef = useRef(null)
  const shouldFollowRef = useRef(true)
  const isInitial = messages.length === 0

  const closePanel = useCallback(() => {
    setPanelOpen(false)
    window.requestAnimationFrame(() => launcherRef.current?.focus())
  }, [])

  useEffect(() => {
    if (!shouldFollowRef.current) return
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  useEffect(() => {
    const focusChat = (event) => {
      if (event.detail?.question) setDraft(event.detail.question)
      if (!isInitial) setPanelOpen(true)
      window.setTimeout(() => inputRef.current?.focus(), isInitial ? 500 : 120)
    }
    window.addEventListener('portfolio:focus-chat', focusChat)
    return () => window.removeEventListener('portfolio:focus-chat', focusChat)
  }, [isInitial])

  useEffect(() => {
    if (!panelOpen || isInitial) return undefined
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [panelOpen, isInitial])

  useEffect(() => {
    if (!panelOpen) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') closePanel()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [panelOpen, closePanel])

  useEffect(() => {
    const input = inputRef.current
    if (!input) return

    input.style.height = 'auto'
    input.style.height = `${Math.min(input.scrollHeight, 112)}px`
    input.style.overflowY = input.scrollHeight > 112 ? 'auto' : 'hidden'
  }, [draft, isInitial])

  const ask = useCallback((question) => {
    const content = question.trim()
    if (!content) return

    const answer = answerPortfolioQuestion(content)
    const userMessage = { id: makeId(), role: 'user', content }
    const assistantMessage = {
      id: makeId(),
      role: 'assistant',
      content: answer.text,
      confidence: answer.confidence,
      language: answer.language,
      projectIds: answer.projectIds,
      suggestions: answer.suggestions,
    }

    shouldFollowRef.current = true
    setMessages((current) => [...current, userMessage, assistantMessage])
    setDraft('')
    window.requestAnimationFrame(() => setPanelOpen(true))
  }, [])

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
            Ask a question about Mateo
          </label>
          <textarea
            id="portfolio-question"
            ref={inputRef}
            rows={starter ? 3 : 1}
            maxLength="1200"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault()
                ask(draft)
              }
            }}
            placeholder={starter ? 'Ask anything about Mateo’s work…' : 'Continue the conversation…'}
          />
          <div className="portfolio-chat__form-actions">
            {starter ? (
              <div
                className="portfolio-chat__suggestions"
                role="group"
                aria-label="Suggested questions"
              >
                {chatSuggestions.map((suggestion, index) => (
                  <button type="button" key={suggestion} onClick={() => ask(suggestion)}>
                    {SUGGESTION_LABELS[index] || suggestion}
                  </button>
                ))}
              </div>
            ) : (
              <span className="portfolio-chat__keyhint">
                Enter to send · Shift+Enter for a new line
              </span>
            )}

            <button
              className="portfolio-chat__send"
              type="submit"
              aria-label="Send message"
              disabled={!draft.trim()}
            >
              Send
            </button>
          </div>
        </form>
        <footer className="portfolio-chat__meta">
          Respuestas construidas únicamente con el contenido de este portafolio
        </footer>
      </div>
    )
  }

  return (
    <>
      <section className="portfolio-chat container" id="chat" aria-label="Portfolio guide">
        <div
          className="portfolio-chat__stage"
          data-mode={isInitial ? 'starter' : 'resume'}
          data-inspect="Local portfolio guide"
        >
          {isInitial ? (
            <>
              <div className="portfolio-chat__starter">
                <img className="portfolio-chat__starter-mark" src="/favicon.svg" alt="" />
                <p className="mono">Portfolio intelligence / 01</p>
                <h2>
                  <span>Meet Mateo’s work.</span>
                  <em>What would you like to know?</em>
                </h2>
                <p>
                  Ask about projects, product decisions, frontend practice or Mateo’s current role at
                  Rappi.
                </p>
              </div>
              {renderComposer('starter')}
            </>
          ) : (
            <div className="portfolio-chat__resume">
              <img className="portfolio-chat__starter-mark" src="/favicon.svg" alt="" />
              <p className="mono">Portfolio intelligence / active</p>
              <h2>Your conversation continues beside the portfolio.</h2>
              <p>The guide keeps your questions available while you explore Mateo’s work.</p>
              <button
                type="button"
                className="portfolio-chat__resume-button"
                onClick={() => setPanelOpen(true)}
                aria-controls="portfolio-chat-drawer"
                aria-expanded={panelOpen}
              >
                Open portfolio guide
                <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {!isInitial &&
        createPortal(
          <>
            <aside
              className="portfolio-chat__drawer"
              id="portfolio-chat-drawer"
              data-open={panelOpen ? 'true' : 'false'}
              aria-labelledby="portfolio-chat-title"
              aria-hidden={!panelOpen}
              inert={!panelOpen}
              data-lenis-prevent
            >
              <header className="portfolio-chat__header">
                <div className="portfolio-chat__identity">
                  <img className="portfolio-chat__mark" src="/favicon.svg" alt="" />
                  <span className="portfolio-chat__identity-copy">
                    <strong id="portfolio-chat-title">Mateo portfolio guide</strong>
                    <small>Answers from this portfolio only</small>
                  </span>
                </div>
                <div className="portfolio-chat__header-actions">
                  <span
                    className="portfolio-chat__state"
                    data-state="ready"
                    role="status"
                    aria-atomic="true"
                  >
                    <i aria-hidden="true" /> Local · Ready
                  </span>
                  <button
                    type="button"
                    className="portfolio-chat__close"
                    onClick={closePanel}
                    aria-label="Close portfolio guide"
                  >
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  </button>
                </div>
              </header>

              <div
                className="portfolio-chat__transcript"
                ref={transcriptRef}
                role="log"
                aria-label="Conversation with Mateo portfolio guide"
                aria-live="polite"
                onScroll={(event) => {
                  const transcript = event.currentTarget
                  const distanceFromBottom =
                    transcript.scrollHeight - transcript.scrollTop - transcript.clientHeight
                  shouldFollowRef.current = distanceFromBottom < 48
                }}
              >
                {messages.map((message) => (
                  <article
                    className="portfolio-chat__message"
                    data-role={message.role}
                    key={message.id}
                  >
                    {message.role === 'assistant' && (
                      <span className="portfolio-chat__avatar" aria-hidden="true">
                        <img src="/favicon.svg" alt="" />
                      </span>
                    )}
                    <div className="portfolio-chat__message-content">
                      {message.role === 'assistant' && (
                        <span className="portfolio-chat__message-author">Mateo portfolio guide</span>
                      )}
                      {message.role === 'user' && <span className="visually-hidden">You said:</span>}
                      <p>{message.content}</p>
                      {message.role === 'assistant' && message.projectIds?.length > 0 && (
                        <div
                          className="portfolio-chat__project-actions"
                          role="group"
                          aria-label={
                            message.language === 'es' ? 'Casos relacionados' : 'Related cases'
                          }
                        >
                          {message.projectIds.map((projectId) => {
                            const project = projects.find((item) => item.id === projectId)
                            if (!project || !onOpenProject) return null

                            return (
                              <button
                                type="button"
                                key={project.id}
                                onClick={() => onOpenProject(project)}
                              >
                                {message.language === 'es' ? 'Ver' : 'View'} {project.title}
                                <span aria-hidden="true">↗</span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                      {message.role === 'assistant' &&
                        message.confidence === 'low' &&
                        message.suggestions?.length > 0 && (
                          <div
                            className="portfolio-chat__followups"
                            role="group"
                            aria-label={
                              message.language === 'es'
                                ? 'Preguntas que sí puedo responder'
                                : 'Questions I can answer'
                            }
                          >
                            {message.suggestions.map((suggestion) => (
                              <button type="button" key={suggestion} onClick={() => ask(suggestion)}>
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  </article>
                ))}
              </div>

              {renderComposer('conversation')}
            </aside>

            {!panelOpen && (
              <button
                type="button"
                className="portfolio-chat__launcher"
                ref={launcherRef}
                onClick={() => setPanelOpen(true)}
                aria-controls="portfolio-chat-drawer"
                aria-expanded="false"
              >
                <img src="/favicon.svg" alt="" />
                <span>
                  <small>Portfolio guide</small>
                  Continue conversation
                </span>
                <i aria-hidden="true">
                  {messages.filter((message) => message.role === 'user').length}
                </i>
              </button>
            )}
          </>,
          document.body
        )}
    </>
  )
}
