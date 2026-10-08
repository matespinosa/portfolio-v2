import { SHORT_TITLES } from '../data/copyEs.js'
import { cleanAssistantText } from './portfolioPresentation.js'

const STORAGE_KEY = 'portfolio-chat-session-v1'
const MAX_MESSAGES = 40
const MAX_CONTENT_LENGTH = 6000

const PROFILE_TOPIC_LABELS = {
  current: 'Rol actual',
  frontend: 'Frontend',
  ai: 'Práctica con IA',
  experience: 'Trayectoria',
  location: 'Ubicación',
  practice: 'Práctica',
}

function defaultStorage() {
  try {
    return globalThis.sessionStorage ?? null
  } catch {
    return null
  }
}

function cleanMessage(raw) {
  if (!raw || typeof raw !== 'object') return null
  if (raw.role !== 'user' && raw.role !== 'assistant') return null
  if (typeof raw.id !== 'string' || typeof raw.content !== 'string' || !raw.content.trim()) return null

  const message = {
    id: raw.id,
    role: raw.role,
    content: raw.content.slice(0, MAX_CONTENT_LENGTH),
    createdAt: Number.isFinite(raw.createdAt) ? raw.createdAt : Date.now(),
  }
  if (raw.role === 'user') return message

  return {
    ...message,
    confidence: typeof raw.confidence === 'string' ? raw.confidence : 'high',
    language: raw.language === 'en' ? 'en' : 'es',
    projectIds: Array.isArray(raw.projectIds) ? raw.projectIds.filter((id) => typeof id === 'string') : [],
    suggestions: Array.isArray(raw.suggestions) ? raw.suggestions.filter((item) => typeof item === 'string') : [],
    presentation: raw.presentation && typeof raw.presentation.kind === 'string'
      ? { kind: raw.presentation.kind, topic: String(raw.presentation.topic || '') }
      : { kind: 'narrative', topic: 'general' },
  }
}

// Restores the conversation for this browser tab. A trailing question without an answer
// is dropped: its reply was lost when the page unloaded.
export function loadChatSession(storage = defaultStorage()) {
  if (!storage) return []

  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(parsed)) return []

    const messages = parsed.slice(-MAX_MESSAGES).map(cleanMessage).filter(Boolean)
    while (messages.at(-1)?.role === 'user') messages.pop()
    return messages
  } catch {
    return []
  }
}

export function saveChatSession(messages, storage = defaultStorage()) {
  if (!storage) return

  try {
    if (!messages.length) storage.removeItem(STORAGE_KEY)
    else storage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES)))
  } catch {
    // Storage can be full or blocked; the conversation still works in memory.
  }
}

export function clearChatSession(storage = defaultStorage()) {
  saveChatSession([], storage)
}

function topicsOf(answer) {
  if (answer.presentation?.kind === 'profile-overview') return ['Perfil']
  const labels = (answer.projectIds || []).map((id) => (id === 'rappi' ? 'Rappi' : SHORT_TITLES[id])).filter(Boolean)
  if (answer.presentation?.kind === 'profile-facts') {
    const label = PROFILE_TOPIC_LABELS[answer.presentation.topic]
    if (label) labels.push(label)
  }
  return labels
}

// What the section shows after the window is closed.
export function summarizeChat(messages) {
  const questions = messages.filter((message) => message.role === 'user')
  const answers = messages.filter((message) => message.role === 'assistant')

  return {
    questionCount: questions.length,
    answerCount: answers.length,
    topics: [...new Set(answers.flatMap(topicsOf))],
    lastQuestion: questions.at(-1)?.content || '',
    lastAnswer: cleanAssistantText(answers.at(-1)?.content || ''),
  }
}
