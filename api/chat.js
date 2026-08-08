import { askGemini } from '../server/gemini.js'
import { preparePortfolioRequest, shouldUseGemini } from '../server/portfolioContext.js'
import { createRateLimitStore, reserveGeminiRequest } from '../server/rateLimit.js'

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
}

function answerPayload(answer, extras = {}) {
  return {
    text: answer.text,
    confidence: answer.confidence,
    language: answer.language,
    projectIds: answer.projectIds,
    suggestions: answer.suggestions,
    ...extras,
  }
}

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: NO_STORE_HEADERS })
  }

  const question = typeof body?.question === 'string' ? body.question.trim() : ''
  if (!question || question.length > 1200) {
    return Response.json(
      { error: 'Question must contain between 1 and 1200 characters' },
      { status: 400, headers: NO_STORE_HEADERS },
    )
  }

  const prepared = preparePortfolioRequest(question, body.history)

  if (!shouldUseGemini(prepared)) {
    return Response.json(
      answerPayload(prepared.localAnswer, { source: 'local', reason: 'deterministic' }),
      { headers: NO_STORE_HEADERS },
    )
  }

  const apiKey = process.env.GEMINI_API_KEY
  const redis = createRateLimitStore()
  if (!apiKey || !redis) {
    return Response.json(
      answerPayload(prepared.localAnswer, { source: 'local', reason: 'configuration' }),
      { headers: NO_STORE_HEADERS },
    )
  }

  let reservation
  try {
    reservation = await reserveGeminiRequest({ request, redis })
  } catch (error) {
    console.error('Portfolio chat rate limiter unavailable', error?.message)
    return Response.json(
      answerPayload(prepared.localAnswer, { source: 'local', reason: 'rate-limit-unavailable' }),
      { headers: NO_STORE_HEADERS },
    )
  }

  if (!reservation.allowed) {
    return Response.json(
      answerPayload(prepared.localAnswer, {
        source: 'local',
        reason: `${reservation.reason}-daily-limit`,
        remaining: 0,
      }),
      { headers: NO_STORE_HEADERS },
    )
  }

  try {
    const result = await askGemini({
      apiKey,
      context: prepared.context,
      history: prepared.history,
      question,
    })

    return Response.json(
      {
        text: result.text,
        confidence: 'high',
        language: prepared.localAnswer.language,
        projectIds: prepared.projectIds,
        suggestions: [],
        source: 'gemini',
        remaining: reservation.remaining,
      },
      { headers: NO_STORE_HEADERS },
    )
  } catch (error) {
    console.error('Portfolio chat Gemini request failed', error?.status || error?.message)
    return Response.json(
      answerPayload(prepared.localAnswer, {
        source: 'local',
        reason: 'gemini-unavailable',
        remaining: reservation.remaining,
      }),
      { headers: NO_STORE_HEADERS },
    )
  }
}
