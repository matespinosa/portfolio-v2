import { experience, projects, selectedClients } from '../src/data/projects.js'
import { profile } from '../src/data/profile.js'
import { answerPortfolioQuestion } from '../src/lib/portfolioAssistant.js'

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
    intro: project.intro,
    body: project.body,
    sections: project.sections.map((section) => ({
      title: section.title,
      body: section.body,
      bullets: section.bullets || [],
    })),
    metrics: project.metrics,
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
  const localAnswer = answerPortfolioQuestion(question)
  const relevantIds = new Set(
    localAnswer.projectIds.filter((projectId) => KNOWN_PROJECT_IDS.has(projectId)),
  )

  for (const message of history) {
    for (const projectId of message.projectIds) relevantIds.add(projectId)
  }

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

export function shouldUseGemini({ history, localAnswer }) {
  return history.length > 0 || localAnswer.confidence !== 'high'
}

