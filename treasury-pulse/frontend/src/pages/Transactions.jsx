import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { Card } from '../components/ui'
import { getTransactions, uploadTransactions } from '../api/client'
import { downloadCSV } from '../utils/export'

const PAGE_SIZE = 15

export default function Transactions() {
  const { user, visibleEntities, selectedId } = useApp()
  const [all, setAll] = useState([])
  const [search, setSearch] = useState('')
  const [direction, setDirection] = useState('ALL')
  const [page, setPage] = useState(1)
  const [uploadMsg, setUploadMsg] = useState('')

  useEffect(() => {
    getTransactions().then(setAll)
  }, [])

  const allowed = visibleEntities.map((e) => e.id)
  const rows = all
    .filter((t) => allowed.includes(t.entity))
    .filter((t) => selectedId === 'ALL' || t.entity === selectedId)
    .filter((t) => direction === 'ALL' || t.direction === direction)
    .filter((t) => `${t.id} ${t.type} ${t.entity} ${t.status}`.toLowerCase().includes(search.toLowerCase()))

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  const pageRows = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadMsg('Uploading…')
    try {
      const result = await uploadTransactions(file)
      setUploadMsg(result.message ?? 'Upload complete')
    } catch {
      setUploadMsg('Upload failed')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Transactions</h2>
        <div className="flex items-center gap-3">
          {user.role === 'ADMIN' && (
            <label className="text-sm border rounded-lg px-3 py-1.5 cursor-pointer bg-white hover:bg-slate-50">
              ⬆ Upload CSV
              <input type="file" accept=".csv" onChange={handleUpload} className="hidden" />
            </label>
          )}
          <button onClick={() => downloadCSV(rows, 'transactions.csv')}
            className="text-sm bg-emerald-600 text-white rounded-lg px-3 py-1.5">
            ⬇ Export CSV
          </button>
        </div>
      </div>
      {uploadMsg && <p className="text-sm text-slate-500">{uploadMsg}</p>}

      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <input placeholder="Search id, type, entity…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="border rounded-lg px-3 py-1.5 text-sm flex-1 min-w-48" />
          <select value={direction} onChange={(e) => { setDirection(e.target.value); setPage(1) }}
            className="border rounded-lg px-3 py-1.5 text-sm">
            <option value="ALL">All directions</option>
            <option value="INFLOW">Inflows</option>
            <option value="OUTFLOW">Outflows</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2 px-2">ID</th><th className="px-2">Date</th><th className="px-2">Entity</th>
                <th className="px-2">Type</th><th className="px-2">Direction</th>
                <th className="px-2 text-right">Amount</th><th className="px-2">Due</th><th className="px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((t) => (
                <tr key={t.id} className="border-b hover:bg-slate-50">
                  <td className="py-2 px-2 font-mono text-xs">{t.id}</td>
                  <td className="px-2">{t.date}</td>
                  <td className="px-2">{t.entity}</td>
                  <td className="px-2">{t.type}</td>
                  <td className={`px-2 ${t.direction === 'INFLOW' ? 'text-emerald-700' : 'text-red-600'}`}>
                    {t.direction === 'INFLOW' ? '↓ In' : '↑ Out'}
                  </td>
                  <td className="px-2 text-right">{t.amount.toLocaleString()} {t.currency}</td>
                  <td className="px-2">{t.due_date}</td>
                  <td className="px-2">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-slate-500">{rows.length} transactions</span>
          <div className="flex items-center gap-2">
            <button disabled={current === 1} onClick={() => setPage(current - 1)}
              className="border rounded px-3 py-1 disabled:opacity-40">Prev</button>
            <span>Page {current} / {pages}</span>
            <button disabled={current === pages} onClick={() => setPage(current + 1)}
              className="border rounded px-3 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      </Card>
    </div>
  )
}