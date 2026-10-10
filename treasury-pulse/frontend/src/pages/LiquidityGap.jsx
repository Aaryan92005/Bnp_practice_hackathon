import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Card, StatusBadge } from '../components/ui'
import { money, RISK_ORDER, ROW_TINT } from '../utils/liquidity'

export default function LiquidityGap() {
  const { summaries, setSelectedId } = useApp()
  const navigate = useNavigate()
  const rows = [...summaries].sort((a, b) => RISK_ORDER[a.status] - RISK_ORDER[b.status])

  function open(id) {
    setSelectedId(id)
    navigate('/')
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Liquidity Gap</h2>
      <p className="text-sm text-slate-500">
        Gap (G) = Projected position (P) − Threshold (T). Status uses the lowest projected balance
        in the next 30 days. Click a row to open it on the dashboard.
      </p>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2 px-2">Entity</th>
                <th className="px-2">Currency</th>
                <th className="px-2 text-right">Today (P)</th>
                <th className="px-2 text-right">Threshold (T)</th>
                <th className="px-2 text-right">Gap today</th>
                <th className="px-2 text-right">Lowest in 30d</th>
                <th className="px-2 text-right">Gap at lowest</th>
                <th className="px-2">First breach</th>
                <th className="px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} onClick={() => open(s.id)}
                  className={`border-b cursor-pointer hover:brightness-95 ${ROW_TINT[s.status]}`}>
                  <td className="py-2 px-2 font-medium">{s.name}</td>
                  <td className="px-2">{s.currency}</td>
                  <td className="px-2 text-right">{money(s.position, s.currency)}</td>
                  <td className="px-2 text-right">{money(s.threshold, s.currency)}</td>
                  <td className={`px-2 text-right ${s.gap < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {money(s.gap, s.currency)}
                  </td>
                  <td className="px-2 text-right">{money(s.worst, s.currency)}</td>
                  <td className={`px-2 text-right ${s.worstGap < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {money(s.worstGap, s.currency)}
                  </td>
                  <td className="px-2">{s.breachDate ?? '—'}</td>
                  <td className="px-2"><StatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}