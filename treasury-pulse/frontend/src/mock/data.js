// FAKE DATA so the frontend works before the backend is ready.
// TODO: change entity names to the ones in your hackathon CSV.

export const ENTITIES = [
    { id: 'PARIS', name: 'Paris', currency: 'EUR' },
    { id: 'FRANKFURT', name: 'Frankfurt', currency: 'EUR' },
    { id: 'LONDON', name: 'London', currency: 'GBP' },
    { id: 'NEWYORK', name: 'New York', currency: 'USD' },
    { id: 'MUMBAI', name: 'Mumbai', currency: 'INR' },
    { id: 'TOKYO', name: 'Tokyo', currency: 'JPY' },
    { id: 'SINGAPORE', name: 'Singapore', currency: 'SGD' },
    { id: 'HONGKONG', name: 'Hong Kong', currency: 'HKD' },
  ]
  
  // EUR, USD, JPY, GBP come from the problem statement. The others are our own guesses.
  export const DEFAULT_THRESHOLDS = {
    EUR: 50000, USD: 60000, JPY: 5000000, GBP: 40000,
    INR: 4000000, SGD: 70000, HKD: 400000,
  }
  
  // Rough exchange rates, used to add up all cash in EUR
  export const FX_TO_EUR = {
    EUR: 1, USD: 0.92, GBP: 1.17, JPY: 0.0062, INR: 0.011, SGD: 0.68, HKD: 0.118,
  }
  
  const DAY = 24 * 60 * 60 * 1000
  const now = new Date()
  const TODAY = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  // Date -> "2026-10-10"
  export function isoDate(d) {
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${m}-${day}`
  }
  
  // A "random" generator that gives the same numbers every time (stable demo)
  function seeded(seed) {
    let s = seed
    return () => {
      s = (s * 9301 + 49297) % 233280
      return s / 233280
    }
  }
  
  // 30 days of history + 30 days of forecast for one entity
  export function makeSeries(entity) {
    const index = ENTITIES.findIndex((e) => e.id === entity.id)
    const rand = seeded(index + 7)
    const T = DEFAULT_THRESHOLDS[entity.currency]
    const todayLevel = [2.2, 1.6, 1.3, 1.9, 1.25, 1.45, 1.1, 1.7][index] * T
    const drift = [0.01, -0.005, -0.008, 0.004, -0.006, -0.01, -0.004, 0.002][index] * T
  
    let running = 0
    const days = []
    for (let i = -30; i <= 30; i++) {
      const inflow = T * (0.3 + rand() * 0.3)
      const outflow = Math.max(0, inflow - drift + T * (rand() - 0.5) * 0.06)
      running += inflow - outflow
      days.push({ i, inflow, outflow, running })
    }
  
    const shift = todayLevel - days[30].running // make today's balance = todayLevel
    return days.map(({ i, inflow, outflow, running }) => {
      const balance = Math.round(running + shift)
      const spread = Math.round(T * 0.04 * Math.sqrt(Math.max(i, 0))) // uncertainty grows
      return {
        date: isoDate(new Date(TODAY.getTime() + i * DAY)),
        inflow: Math.round(inflow),
        outflow: Math.round(outflow),
        actual: i <= 0 ? balance : null,   // past days
        forecast: i >= 0 ? balance : null, // future days
        lower: i >= 0 ? balance - spread : null,
        upper: i >= 0 ? balance + spread : null,
      }
    })
  }
  
  const TYPES = ['Salary', 'Supplier Invoice', 'Loan Repayment', 'Customer Receipt',
    'Tax', 'Capex', 'Intercompany', 'FX Settlement']
  
  export function makeTransactions(count = 500) {
    const rand = seeded(42)
    return Array.from({ length: count }, (_, n) => {
      const e = ENTITIES[Math.floor(rand() * ENTITIES.length)]
      const date = new Date(TODAY.getTime() - Math.floor(rand() * 60) * DAY)
      const due = new Date(date.getTime() + Math.floor(rand() * 30) * DAY)
      return {
        id: 'TX' + String(n + 1).padStart(5, '0'),
        date: isoDate(date),
        entity: e.id,
        currency: e.currency,
        amount: Math.round(DEFAULT_THRESHOLDS[e.currency] * (0.02 + rand() * 0.4)),
        direction: rand() < 0.5 ? 'INFLOW' : 'OUTFLOW',
        type: TYPES[Math.floor(rand() * TYPES.length)],
        due_date: isoDate(due),
        status: rand() < 0.7 ? 'Settled' : 'Pending',
      }
    }).sort((a, b) => b.date.localeCompare(a.date))
  }