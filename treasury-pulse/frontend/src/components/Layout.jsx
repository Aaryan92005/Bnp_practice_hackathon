import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Filters from './Filters'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/gap', label: 'Liquidity Gap', icon: '📉' },
  { to: '/alerts', label: 'Alerts', icon: '🚨' },
  { to: '/whatif', label: 'What-If', icon: '🎛️' },
  { to: '/transactions', label: 'Transactions', icon: '📄' },
  { to: '/reports', label: 'Reports', icon: '🧾' },
  { to: '/chat', label: 'AI Assistant', icon: '🤖' },
  { to: '/settings', label: 'Settings', icon: '⚙️', roles: ['ADMIN'] },
]

export default function Layout() {
  const { user, setUser, summaries, loading } = useApp()
  const navigate = useNavigate()

  if (!user) return <Navigate to="/login" replace />

  const alertCount = summaries.filter((s) => s.status !== 'OK').length
  const links = NAV.filter((link) => !link.roles || link.roles.includes(user.role))

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800">
      <aside className="w-60 shrink-0 bg-slate-900 text-slate-100 flex flex-col">
        <div className="p-5 border-b border-slate-800">
          <h1 className="text-lg font-bold">Treasury Pulse</h1>
          <p className="text-xs text-slate-400">Liquidity Command Center</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  isActive ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800'
                }`
              }
            >
              <span>{link.icon}</span>
              <span className="flex-1">{link.label}</span>
              {link.to === '/alerts' && alertCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2">{alertCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 text-sm">
          <p className="font-medium">{user.name}</p>
          <p className="text-xs text-slate-400 mb-2">
            {user.role}{user.entity ? ` · ${user.entity}` : ''}
          </p>
          <button
            onClick={() => { setUser(null); navigate('/login') }}
            className="text-xs text-red-300 hover:text-red-200"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="flex items-center justify-between bg-white border-b px-6 py-3">
          <span className="text-sm text-slate-500">{new Date().toDateString()}</span>
          <Filters />
        </header>
        <div className="p-6">{loading ? <p>Loading data…</p> : <Outlet />}</div>
      </main>
    </div>
  )
}