import { Sparkle } from '@phosphor-icons/react'

const MAX_TOPICS = 4

// Shown under the chat box's composer once the window is closed: where the conversation
// stands, plus the ways back into it.
export default function PortfolioChatSummary({ summary, isSending, actionRef, onContinue, onReset }) {
  const { questionCount, topics, lastQuestion, lastAnswer } = summary
  const extraTopics = topics.length - MAX_TOPICS

  return (
    <section className="portfolio-chat__summary" aria-label="Resumen de la conversación">
      <header className="portfolio-chat__summary-head">
        <span className="portfolio-chat__summary-mark" aria-hidden="true"><Sparkle size={18} weight="fill" /></span>
        <div>
          <p className="mono">Guía del portafolio</p>
          <h2>Tu conversación</h2>
        </div>
        <span className="portfolio-chat__summary-count mono">
          {questionCount} {questionCount === 1 ? 'pregunta' : 'preguntas'}
        </span>
      </header>

      {topics.length > 0 && (
        <ul className="portfolio-chat__summary-topics" aria-label="Temas tratados">
          {topics.slice(0, MAX_TOPICS).map((topic) => <li key={topic}>{topic}</li>)}
          {extraTopics > 0 && <li>+{extraTopics}</li>}
        </ul>
      )}

      <dl className="portfolio-chat__summary-last">
        <div>
          <dt className="mono">Última pregunta</dt>
          <dd>{lastQuestion}</dd>
        </div>
        {lastAnswer && (
          <div>
            <dt className="mono">{isSending ? 'Preparando respuesta' : 'Última respuesta'}</dt>
            <dd data-clamp>{isSending ? 'Conectando tu pregunta con el portafolio…' : lastAnswer}</dd>
          </div>
        )}
      </dl>

      <div className="portfolio-chat__summary-actions">
        <button type="button" className="portfolio-chat__summary-primary" ref={actionRef} onClick={onContinue}>
          Continuar conversación
        </button>
        <button type="button" className="portfolio-chat__summary-secondary" onClick={onReset} disabled={isSending}>
          Nueva conversación
        </button>
      </div>
    </section>
  )
}
