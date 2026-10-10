import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { Card, StatusBadge } from '../components/ui'
import ForecastChart from '../components/ForecastChart'
import { applyScenario } from '../utils/scenario'
import { getStatus, money } from '../utils/liquidity'

const START = { delay: 0, fx: 0, rate: 0, capex: 0 }
const sign = (v) => (v > 0 ? '+' : '')

function Slider({ label, help, value, min, max, step, onChange, format }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="font-semibold text-violet-700">{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={onChange} className="w-full accent-violet-600" />
      <p className="text-xs text-slate-400">{help}</p>
    </div>
  )
}

export default function WhatIf() {
  const { summaries, forecasts, selectedId } = useApp()
  const [entityId, setEntityId] = useState(selectedId !== 'ALL' ? selectedId : summaries[0]?.id)
  const [s, setS] = useState(START)

  const entity = summaries.find((e) => e.id === entityId) ?? summaries[0]
  const T = entity.threshold
  const data = useMemo(() => applyScenario(forecasts[entity.id], s), [forecasts, entity.id, s])

  const future = data.filter((p) => p.forecast !== null)
  const baseWorst = Math.min(...future.map((p) => p.forecast))
  const scenWorst = Math.min(...future.map((p) => p.scenario))
  const update = (key) => (e) => setS({ ...s, [key]: Number(e.target.value) })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">What-If Simulator</h2>
        <select value={entity.id} onChange={(e) => setEntityId(e.target.value)}
          className="border rounded-lg px-3 py-1.5 bg-white text-sm">
          {summaries.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.currency})</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Scenario controls" className="space-y-5">
          <Slider label="Delay payments" help="Push outgoing payments later"
            value={s.delay} min={0} max={5} step={1} onChange={update('delay')}
            format={(v) => `${v} days`} />
          <Slider label="FX move" help="+ means local currency weakens, so foreign payments cost more"
            value={s.fx} min={-15} max={15} step={5} onChange={update('fx')}
            format={(v) => `${sign(v)}${v}%`} />
          <Slider label="Interest rate change" help="Change in yearly rate on cash balance"
            value={s.rate} min={-2} max={2} step={0.25} onChange={update('rate')}
            format={(v) => `${sign(v)}${v}%`} />
          <Slider label="Postpone capex" help="Planned capital spending (day 7) pushed beyond 30 days"
            value={s.capex} min={0} max={T * 0.5} step={T * 0.05} onChange={update('capex')}
            format={(v) => money(v, entity.currency)} />
          <button onClick={() => setS(START)} className="text-sm border rounded-lg px-3 py-1.5 w-full">
            Reset scenario
          </button>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card title="Baseline lowest">
              <p className="text-xl font-bold">{money(baseWorst, entity.currency)}</p>
              <StatusBadge status={getStatus(baseWorst, T)} />
            </Card>
            <Card title="Scenario lowest">
              <p className="text-xl font-bold text-violet-700">{money(scenWorst, entity.currency)}</p>
              <StatusBadge status={getStatus(scenWorst, T)} />
            </Card>
            <Card title="Difference">
              <p className={`text-xl font-bold ${scenWorst >= baseWorst ? 'text-emerald-600' : 'text-red-600'}`}>
                {sign(scenWorst - baseWorst)}{money(scenWorst - baseWorst, entity.currency)}
              </p>
            </Card>
          </div>
          <Card title={`${entity.name} · baseline vs scenario`}>
            <ForecastChart data={data} threshold={T} showScenario />
          </Card>
        </div>
      </div>
    </div>
  )
}