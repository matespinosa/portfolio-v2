const REQUEST_TIMEOUT_MS = 22_000

export function serializeChatHistory(messages) {
  return messages.slice(-6).map(({ role, content, projectIds = [] }) => ({
    role,
    content,
    projectIds,
  }))
}

export async function requestPortfolioAnswer({ question, history, fetchImpl = fetch }) {
  const response = await fetchImpl('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, history }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload?.text) {
    throw new Error(payload?.error || `Portfolio chat failed with status ${response.status}`)
  }

  return payload
}

