import {
    ComposedChart, Line, Area, XAxis, YAxis, Tooltip, Legend,
    ReferenceLine, ResponsiveContainer, CartesianGrid,
  } from 'recharts'
  import { compact } from '../utils/liquidity'
  
  const fmt = (v) =>
    v == null ? '–' : Array.isArray(v) ? `${compact(v[0])} – ${compact(v[1])}` : compact(v)
  
  export default function ForecastChart({ data, threshold, showScenario = false }) {
    return (
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} minTickGap={20} />
          <YAxis tickFormatter={compact} width={60} />
          <Tooltip formatter={fmt} />
          <Legend />
          <Area dataKey="band" name="Confidence range" fill="#10b981" fillOpacity={0.15} stroke="none" />
          <Line dataKey="actual" name="Actual" stroke="#0f172a" strokeWidth={2} dot={false} />
          <Line dataKey="forecast" name="Forecast" stroke="#059669" strokeWidth={2} dot={false}
            strokeDasharray={showScenario ? '4 4' : undefined} />
          {showScenario && (
            <Line dataKey="scenario" name="Scenario" stroke="#7c3aed" strokeWidth={2.5} dot={false} />
          )}
          <ReferenceLine y={threshold} stroke="#dc2626" strokeDasharray="6 4"
            label={{ value: 'Threshold', fill: '#dc2626', position: 'insideTopRight' }} />
        </ComposedChart>
      </ResponsiveContainer>
    )
  }