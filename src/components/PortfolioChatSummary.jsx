import { useLanguage } from '../lib/useLanguage'
import { Sparkle } from '@phosphor-icons/react'

const MAX_TOPICS = 4

// Shown under the chat box's composer once the window is closed: where the conversation
// stands, plus the ways back into it.
export default function PortfolioChatSummary({ summary, isSending, actionRef, onContinue, onReset }) {
  const { t } = useLanguage()
  const { questionCount, topics, lastQuestion, lastAnswer } = summary
  const extraTopics = topics.length - MAX_TOPICS

  return (
    <section className="portfolio-chat__summary" aria-label={t("Conversation summary")}>
      <header className="portfolio-chat__summary-head">
        <span className="portfolio-chat__summary-mark" aria-hidden="true"><Sparkle size={18} weight="fill" /></span>
        <div>
          <p className="mono">{t("Portfolio guide")}</p>
          <h2>{t("Your conversation")}</h2>
        </div>
        <span className="portfolio-chat__summary-count mono">
          {questionCount} {t(questionCount === 1 ? 'question' : 'questions')}
        </span>
      </header>

      {topics.length > 0 && (
        <ul className="portfolio-chat__summary-topics" aria-label={t("Topics discussed")}>
          {topics.slice(0, MAX_TOPICS).map((topic) => <li key={topic}>{topic}</li>)}
          {extraTopics > 0 && <li>+{extraTopics}</li>}
        </ul>
      )}

      <dl className="portfolio-chat__summary-last">
        <div>
          <dt className="mono">{t("Last question")}</dt>
          <dd>{lastQuestion}</dd>
        </div>
        {lastAnswer && (
          <div>
            <dt className="mono">{t(isSending ? 'Preparing answer' : 'Last answer')}</dt>
            <dd data-clamp>{isSending ? t('Matching your question to the portfolio…') : lastAnswer}</dd>
          </div>
        )}
      </dl>

      <div className="portfolio-chat__summary-actions">
        <button type="button" className="portfolio-chat__summary-primary" ref={actionRef} onClick={onContinue}> {t("Continue conversation")} </button>
        <button type="button" className="portfolio-chat__summary-secondary" onClick={onReset} disabled={isSending}> {t("New conversation")} </button>
      </div>
    </section>
  )
}
