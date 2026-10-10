import {
    BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  } from 'recharts'
  import { useApp } from '../context/AppContext'
  import { Card, StatCard, StatusBadge } from '../components/ui'
  import ForecastChart from '../components/ForecastChart'
  import { money, compact, toEUR, RISK_ORDER } from '../utils/liquidity'
  
  const COLORS = ['#059669', '#2563eb', '#7c3aed', '#d97706', '#dc2626', '#0891b2', '#4f46e5', '#65a30d']
  
  export default function Dashboard() {
    const { summaries, forecasts, selectedId } = useApp()
    if (!summaries.length) return <p>No data for your access level.</p>
  
    let shown = selectedId === 'ALL' ? summaries : summaries.filter((s) => s.id === selectedId)
    if (!shown.length) shown = summaries
  
    const totalEUR = shown.reduce((sum, s) => sum + toEUR(s.position, s.currency), 0)
    const atRisk = shown.filter((s) => s.status !== 'OK')
    const breaches = shown.filter((s) => s.breachDate)
      .sort((a, b) => a.breachDate.localeCompare(b.breachDate))
  
    // Entity shown in the big chart: the selected one, or the most at-risk one
    const focus = [...shown].sort((a, b) =>
      RISK_ORDER[a.status] - RISK_ORDER[b.status] || a.worstGap / a.threshold - b.worstGap / b.threshold
    )[0]
    const series = forecasts[focus.id]
    const flows = series.filter((p) => p.actual !== null).slice(-14)
  
    const byCurrency = Object.values(
      shown.reduce((acc, s) => {
        acc[s.currency] ??= { name: s.currency, value: 0 }
        acc[s.currency].value += Math.max(0, Math.round(toEUR(s.position, s.currency)))
        return acc
      }, {})
    )
  
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
  
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total cash (EUR equiv.)" value={money(totalEUR, 'EUR')} />
          <StatCard label="Entities healthy" value={`${shown.length - atRisk.length} / ${shown.length}`}
            tone="text-emerald-600" />
          <StatCard label="Entities at risk" value={atRisk.length}
            tone={atRisk.length ? 'text-red-600' : 'text-emerald-600'} />
          <StatCard label="Next threshold breach"
            value={breaches[0] ? breaches[0].breachDate : 'None'}
            hint={breaches[0] ? `${breaches[0].name} · ${breaches[0].currency}` : 'in the next 30 days'} />
        </div>
  
        <Card title={`${focus.name} · ${focus.currency} · 30-day forecast${selectedId === 'ALL' ? ' (most at risk)' : ''}`}>
          <div className="flex items-center gap-3 mb-2 text-sm">
            <StatusBadge status={focus.status} />
            <span>Lowest: {money(focus.worst, focus.currency)} on {focus.worstDate}</span>
          </div>
          <ForecastChart data={series} threshold={focus.threshold} />
        </Card>
  
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title={`Inflows vs outflows · last 14 days · ${focus.name}`}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={flows}>
                <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
                <YAxis tickFormatter={compact} width={55} />
                <Tooltip formatter={(v) => compact(v)} />
                <Legend />
                <Bar dataKey="inflow" name="Inflow" fill="#059669" />
                <Bar dataKey="outflow" name="Outflow" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
  
          <Card title="Cash by currency (EUR equivalent)">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byCurrency} dataKey="value" nameKey="name"
                  innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {byCurrency.map((c, i) => <Cell key={c.name} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => money(v, 'EUR')} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    )
  }