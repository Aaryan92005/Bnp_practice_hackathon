import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

// Simple demo login (the problem statement says no complex security is needed)
const DEMO_USERS = [
  { name: 'Admin', role: 'ADMIN', desc: 'Admin · sees all entities, edits thresholds, uploads data' },
  { name: 'Asha', role: 'USER', entity: 'MUMBAI', desc: 'User · sees only Mumbai' },
]

export default function Login() {
  const { setUser, setSelectedId } = useApp()
  const navigate = useNavigate()

  function login(u) {
    setUser(u)
    setSelectedId(u.role === 'USER' ? u.entity : 'ALL')
    navigate('/')
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-900 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h1 className="text-2xl font-bold">Treasury Pulse</h1>
        <p className="text-slate-500 mb-6">Choose a demo user to sign in</p>
        <div className="space-y-3">
          {DEMO_USERS.map((u) => (
            <button
              key={u.name}
              onClick={() => login(u)}
              className="w-full text-left border rounded-xl p-4 hover:border-emerald-500 hover:bg-emerald-50"
            >
              <p className="font-semibold">{u.name}</p>
              <p className="text-sm text-slate-500">{u.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}