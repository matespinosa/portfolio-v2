import { experience, projects, selectedClients } from '../src/data/projects.js'
import { profile } from '../src/data/profile.js'
import { answerPortfolioQuestion, canAnswerLocally, mentionedProjectIds } from '../src/lib/portfolioAssistant.js'
import { isPortfolioFollowUp } from '../src/lib/portfolioPresentation.js'

const MAX_HISTORY_MESSAGES = 6
const MAX_MESSAGE_LENGTH = 1200
const KNOWN_PROJECT_IDS = new Set([...projects.map((project) => project.id), 'rappi'])

function compactProject(project) {
  return {
    id: project.id,
    title: project.title,
    category: project.category,
    role: project.role,
    scope: project.scope,
    team: project.team,
    duration: project.duration,
    sourceUrl: project.sourceUrl,
    intro: project.intro,
    body: project.body,
    sections: project.sections.map((section) => ({
      title: section.title,
      body: section.body,
      bullets: section.bullets || [],
    })),
    metrics: project.metrics,
    metricsNote: project.metricsNote,
    outcomesLabel: project.outcomesLabel,
    outcomes: project.outcomes,
  }
}

export function sanitizeHistory(rawHistory) {
  if (!Array.isArray(rawHistory)) return []

  return rawHistory
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => ({
      role: message?.role === 'assistant' ? 'assistant' : 'user',
      content: String(message?.content || '').trim().slice(0, MAX_MESSAGE_LENGTH),
      projectIds: Array.isArray(message?.projectIds)
        ? message.projectIds.filter((id) => KNOWN_PROJECT_IDS.has(id)).slice(0, projects.length)
        : [],
    }))
    .filter((message) => message.content)
}

export function preparePortfolioRequest(question, rawHistory) {
  const history = sanitizeHistory(rawHistory)
  const initialAnswer = answerPortfolioQuestion(question)
  const explicitlyMentionedIds = mentionedProjectIds(question)
  const latestContextIds = [...history]
    .reverse()
    .find((message) => message.projectIds.some((projectId) => projectId !== 'rappi'))
    ?.projectIds.filter((projectId) => projectId !== 'rappi') || []
  const shouldInheritContext =
    isPortfolioFollowUp(question) &&
    explicitlyMentionedIds.length === 0 &&
    !initialAnswer.projectIds.includes('rappi') &&
    latestContextIds.length > 0
  const localAnswer = shouldInheritContext
    ? answerPortfolioQuestion(question, { projectIds: latestContextIds })
    : initialAnswer
  const relevantIds = new Set(
    localAnswer.projectIds.filter((projectId) => KNOWN_PROJECT_IDS.has(projectId)),
  )

  const selectedProjects = relevantIds.size
    ? projects.filter((project) => relevantIds.has(project.id))
    : projects

  const context = JSON.stringify({
    profile,
    experience,
    selectedClients,
    projects: selectedProjects.map(compactProject),
  })

  return {
    context,
    history,
    localAnswer,
    projectIds: [...relevantIds],
  }
}

// Gemini handles open questions and follow-ups that depend on the conversation; clear,
// self-contained questions stay local so the small daily quota lasts for more visitors.
export function shouldUseGemini({ history, localAnswer }) {
  return !canAnswerLocally({ history, localAnswer })
}
