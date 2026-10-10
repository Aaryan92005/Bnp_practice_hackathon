import { useState } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useApp } from '../context/AppContext'
import { Card, StatusBadge } from '../components/ui'
import { downloadCSV } from '../utils/export'

const fmt = (v) => (typeof v === 'number' ? v.toLocaleString() : v)

export default function Reports() {
  const { summaries, user } = useApp()
  const [type, setType] = useState('SOD')
  const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
  const title = type === 'SOD' ? 'Start-of-Day Report' : 'End-of-Day Report'

  const rows = summaries.map((s) =>
    type === 'SOD'
      ? {
          Entity: s.name, Currency: s.currency, Opening: s.opening,
          'Expected in': s.inflowToday, 'Expected out': s.outflowToday,
          'Projected close': s.position, Threshold: s.threshold, Status: s.status,
        }
      : {
          Entity: s.name, Currency: s.currency, Closing: s.position, Threshold: s.threshold,
          Gap: s.gap, 'Lowest 30d': s.worst, 'First breach': s.breachDate ?? '-', Status: s.status,
        }
  )
  const headers = rows.length ? Object.keys(rows[0]) : []

  function downloadPDF() {
    const doc = new jsPDF({ orientation: 'landscape' })
    doc.setFontSize(16)
    doc.text(`Treasury Pulse – ${title}`, 14, 16)
    doc.setFontSize(10)
    doc.text(`Date: ${today}    Prepared for: ${user.name} (${user.role})`, 14, 23)
    autoTable(doc, {
      startY: 28,
      head: [headers],
      body: rows.map((r) => headers.map((h) => fmt(r[h]))),
      headStyles: { fillColor: [5, 150, 105] },
    })
    doc.save(`${type}_report_${today}.pdf`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Reports</h2>
        <div className="flex gap-2">
          {['SOD', 'EOD'].map((t) => (
            <button key={t} onClick={() => setType(t)}
              className={`px-4 py-1.5 rounded-lg text-sm border ${type === t ? 'bg-slate-900 text-white' : 'bg-white'}`}>
              {t === 'SOD' ? 'Start of Day' : 'End of Day'}
            </button>
          ))}
        </div>
      </div>

      <Card title={`${title} · ${today}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                {headers.map((h) => <th key={h} className="py-2 px-2">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.Entity} className="border-b">
                  {headers.map((h) => (
                    <td key={h} className="py-2 px-2">
                      {h === 'Status' ? <StatusBadge status={r[h]} /> : fmt(r[h])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={downloadPDF} className="bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm">
            ⬇ Download PDF
          </button>
          <button onClick={() => downloadCSV(rows, `${type}_report_${today}.csv`)}
            className="border rounded-lg px-4 py-2 text-sm">
            ⬇ Download CSV
          </button>
        </div>
      </Card>
    </div>
  )
}