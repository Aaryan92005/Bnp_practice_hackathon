import axios from 'axios'
import { ENTITIES, makeSeries, makeTransactions } from '../mock/data'
import { money } from '../utils/liquidity'

// true  = use fake data
// false = call the real FastAPI backend
export const USE_MOCK = true

const http = axios.create({ baseURL: 'http://localhost:8000' })
const wait = (data) => new Promise((resolve) => setTimeout(() => resolve(data), 200))
let txCache = null

export async function getEntities() {
  if (USE_MOCK) return wait(ENTITIES)
  return (await http.get('/entities')).data
}

export async function getForecast(entityId) {
  const raw = USE_MOCK
    ? await wait(makeSeries(ENTITIES.find((e) => e.id === entityId)))
    : (await http.get('/forecast', { params: { entity: entityId } })).data
  // Recharts needs the confidence range as [lower, upper]
  return raw.map((p) => ({ ...p, band: p.lower != null ? [p.lower, p.upper] : null }))
}

export async function getTransactions() {
  if (USE_MOCK) {
    txCache ??= makeTransactions()
    return wait(txCache)
  }
  return (await http.get('/transactions')).data
}

export async function uploadTransactions(file) {
  if (USE_MOCK) return wait({ message: 'Mock mode: file was not sent to a backend.' })
  const form = new FormData()
  form.append('file', file)
  return (await http.post('/upload', form)).data
}

export async function askAssistant(question, summaries) {
  if (USE_MOCK) return wait(mockAnswer(question, summaries))
  return (await http.post('/chat', { question })).data.answer
}

// Simple fake chatbot until the real AI backend exists
function mockAnswer(question, summaries) {
  const q = question.toLowerCase()
  const hit = summaries.find(
    (s) => q.includes(s.name.toLowerCase()) || q.includes(s.currency.toLowerCase())
  )
  if (hit) {
    let text = `${hit.name} (${hit.currency}): today's position is ${money(hit.position, hit.currency)} ` +
      `vs threshold ${money(hit.threshold, hit.currency)}. Lowest projected balance in the next 30 days ` +
      `is ${money(hit.worst, hit.currency)} on ${hit.worstDate}. Status: ${hit.status}.`
    if (hit.breachDate) text += ` It first falls below the threshold on ${hit.breachDate}.`
    return text
  }
  if (q.includes('risk') || q.includes('short') || q.includes('alert')) {
    const risky = summaries.filter((s) => s.status !== 'OK')
    return risky.length
      ? `Entities at risk: ${risky.map((s) => `${s.name} (${s.status})`).join(', ')}.`
      : 'No entities are at risk in the next 30 days.'
  }
  return "Try asking 'How is Mumbai doing?' or 'Which entities are at risk?'. (Mock mode: connect the backend /chat endpoint for real AI answers.)"
}