import { normalizeLanguage, PORTFOLIO_LANGUAGE } from '../data/language.js'

const REQUEST_TIMEOUT_MS = 22_000

export function serializeChatHistory(messages) {
  return messages.slice(-6).map(({ role, content, projectIds = [] }) => ({
    role,
    content,
    projectIds,
  }))
}

export async function requestPortfolioAnswer({ question, history, language = PORTFOLIO_LANGUAGE, fetchImpl = fetch }) {
  const response = await fetchImpl('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept-Language': normalizeLanguage(language) },
    body: JSON.stringify({ question, history, language: normalizeLanguage(language) }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload?.text || (payload.language && payload.language !== normalizeLanguage(language))) {
    throw new Error(payload?.error || `Portfolio chat failed with status ${response.status}`)
  }

  return payload
}

