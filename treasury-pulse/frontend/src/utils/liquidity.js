import { FX_TO_EUR } from '../mock/data'

// Alert rules from the problem statement
export function getStatus(projected, threshold) {
  if (projected < threshold) return 'EMERGENCY'
  const headroom = (projected - threshold) / threshold
  if (headroom <= 0.05) return 'CRITICAL'
  if (headroom <= 0.10) return 'WARNING'
  return 'OK'
}

export const RISK_ORDER = { EMERGENCY: 0, CRITICAL: 1, WARNING: 2, OK: 3 }

export const STATUS_STYLES = {
  OK: 'bg-emerald-100 text-emerald-800',
  WARNING: 'bg-amber-100 text-amber-800',
  CRITICAL: 'bg-red-100 text-red-800',
  EMERGENCY: 'bg-slate-900 text-white',
}

export const ROW_TINT = {
  OK: '', WARNING: 'bg-amber-50', CRITICAL: 'bg-red-50', EMERGENCY: 'bg-red-100',
}

// 50000, 'EUR' -> "€50,000"
export function money(value, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(value)
}

// 1250000 -> "1.3M"
export function compact(value) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact', maximumFractionDigits: 1,
  }).format(value)
}

export const toEUR = (amount, currency) => amount * (FX_TO_EUR[currency] ?? 1)

// One entity's daily series -> the numbers every page needs
// P = opening + inflow - outflow,  G = P - T
export function summarize(entity, series, threshold) {
  const future = series.filter((p) => p.forecast !== null)
  const today = future[0]
  const yesterday = series[series.indexOf(today) - 1]
  const worst = future.reduce((low, p) => (p.forecast < low.forecast ? p : low))
  const breach = future.find((p) => p.forecast < threshold)

  return {
    ...entity,
    threshold,
    opening: yesterday ? yesterday.actual : today.forecast,
    inflowToday: today.inflow,
    outflowToday: today.outflow,
    position: today.forecast,          // P
    gap: today.forecast - threshold,   // G
    worst: worst.forecast,             // lowest balance in next 30 days
    worstDate: worst.date,
    worstGap: worst.forecast - threshold,
    breachDate: breach ? breach.date : null,
    status: getStatus(worst.forecast, threshold),
  }
}