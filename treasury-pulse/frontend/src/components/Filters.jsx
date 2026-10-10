import { useApp } from '../context/AppContext'

export default function Filters() {
  const { visibleEntities, selectedId, setSelectedId } = useApp()
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-500">Entity</span>
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="border rounded-lg px-3 py-1.5 bg-white"
      >
        {visibleEntities.length > 1 && <option value="ALL">All entities</option>}
        {visibleEntities.map((e) => (
          <option key={e.id} value={e.id}>{e.name} ({e.currency})</option>
        ))}
      </select>
    </label>
  )
}