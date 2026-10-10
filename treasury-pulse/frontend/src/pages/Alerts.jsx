import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Card, StatusBadge } from '../components/ui'
import { money, RISK_ORDER } from '../utils/liquidity'

function alertMessage(s) {
  if (s.status === 'EMERGENCY') {
    return `Projected to fall below the ${money(s.threshold, s.currency)} threshold on ${s.breachDate}. ` +
      `Lowest: ${money(s.worst, s.currency)}.`
  }
  const headroom = (((s.worst - s.threshold) / s.threshold) * 100).toFixed(1)
  return `Lowest projected balance ${money(s.worst, s.currency)} on ${s.worstDate} is only ${headroom}% above threshold.`
}

const RULES = [
  ['OK', 'More than 10% above threshold'],
  ['WARNING', '5–10% above threshold'],
  ['CRITICAL', '0–5% above threshold'],
  ['EMERGENCY', 'Below threshold or negative'],
]

export default function Alerts() {
  const { summaries } = useApp()
  const [acknowledged, setAcknowledged] = useState([])

  const alerts = summaries
    .filter((s) => s.status !== 'OK')
    .sort((a, b) => RISK_ORDER[a.status] - RISK_ORDER[b.status])
  const open = alerts.filter((a) => !acknowledged.includes(a.id))
  const done = alerts.filter((a) => acknowledged.includes(a.id))

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Alerts</h2>

      <Card title="Alert rules">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {RULES.map(([status, text]) => (
            <div key={status} className="flex items-center gap-2">
              <StatusBadge status={status} /> <span className="text-slate-600">{text}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title={`Active alerts (${open.length})`}>
        {open.length === 0 && <p className="text-sm text-slate-500">No active alerts 🎉</p>}
        <ul className="space-y-3">
          {open.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-4 border rounded-lg p-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={a.status} />
                  <span className="font-semibold">{a.name} · {a.currency}</span>
                </div>
                <p className="text-sm text-slate-600">{alertMessage(a)}</p>
              </div>
              <button
                onClick={() => setAcknowledged([...acknowledged, a.id])}
                className="text-sm border rounded-lg px-3 py-1 hover:bg-slate-100 shrink-0"
              >
                Acknowledge
              </button>
            </li>
          ))}
        </ul>
      </Card>

      {done.length > 0 && (
        <Card title="Acknowledged">
          <ul className="text-sm text-slate-500 space-y-1">
            {done.map((a) => <li key={a.id}>✔ {a.name} · {a.currency} ({a.status})</li>)}
          </ul>
        </Card>
      )}
    </div>
  )
}