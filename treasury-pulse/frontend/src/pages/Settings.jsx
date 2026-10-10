import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Card } from '../components/ui'
import { DEFAULT_THRESHOLDS } from '../mock/data'

export default function Settings() {
  const { thresholds, setThresholds } = useApp()
  const [draft, setDraft] = useState(thresholds)
  const [saved, setSaved] = useState(false)

  function save() {
    setThresholds(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-2xl font-semibold">Settings</h2>
      <Card title="Minimum balance thresholds (per currency)">
        <div className="space-y-3">
          {Object.entries(draft).map(([currency, value]) => (
            <label key={currency} className="flex items-center justify-between gap-4">
              <span className="font-medium w-16">{currency}</span>
              <input
                type="number"
                value={value}
                onChange={(e) => setDraft({ ...draft, [currency]: Number(e.target.value) })}
                className="border rounded-lg px-3 py-1.5 flex-1"
              />
            </label>
          ))}
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={save} className="bg-emerald-600 text-white rounded-lg px-4 py-2">Save</button>
          <button
            onClick={() => { setDraft(DEFAULT_THRESHOLDS); setThresholds(DEFAULT_THRESHOLDS) }}
            className="border rounded-lg px-4 py-2"
          >
            Reset to defaults
          </button>
          {saved && <span className="text-emerald-600 self-center text-sm">Saved ✓</span>}
        </div>
      </Card>
    </div>
  )
}