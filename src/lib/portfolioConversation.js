import { answerPortfolioQuestion, mentionedProjectIds } from './portfolioAssistant.js'
import { isPortfolioFollowUp } from './portfolioPresentation.js'

// Browser and API must resolve references against the same latest answer, including Rappi.
export function answerPortfolioConversation(question, history = [], { language } = {}) {
  const initial = answerPortfolioQuestion(question, { language })
  if (initial.standalone || mentionedProjectIds(question).length || !isPortfolioFollowUp(question)) return initial
  const projectIds = [...history].reverse().find((message) => message.role === 'assistant')?.projectIds || []
  return projectIds.length ? answerPortfolioQuestion(question, { projectIds, language }) : initial
}
