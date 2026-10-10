// Simple frontend estimate. Later the backend can do this properly (POST /whatif).
// s = { delay: days, fx: %, rate: %, capex: amount }
export function applyScenario(series, s) {
    const start = series.findIndex((p) => p.forecast !== null) // index of today
    let fxCost = 0
    let interest = 0
  
    return series.map((p, i) => {
      if (i < start) return { ...p, scenario: null }
      const k = i - start // days from today
  
      // 1) Payment delay: outflows from the last `delay` days haven't left yet
      let delayed = 0
      for (let j = Math.max(start + 1, i - s.delay + 1); j <= i; j++) delayed += series[j].outflow
  
      // 2) FX shock: assume 25% of payments are in a foreign currency
      if (k > 0) fxCost += series[i].outflow * 0.25 * (s.fx / 100)
  
      // 3) Interest rate change on the cash balance
      if (k > 0) interest += p.forecast * (s.rate / 100) / 365
  
      // 4) Capex postponed: cash planned for day 7 stays in the account
      const capex = k >= 7 ? s.capex : 0
  
      return { ...p, scenario: Math.round(p.forecast + delayed - fxCost + interest + capex) }
    })
  }