import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getEntities, getForecast } from '../api/client'
import { DEFAULT_THRESHOLDS } from '../mock/data'
import { summarize } from '../utils/liquidity'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null) // { name, role: 'ADMIN' | 'USER', entity? }
  const [entities, setEntities] = useState([])
  const [forecasts, setForecasts] = useState({})
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS)
  const [selectedId, setSelectedId] = useState('ALL')
  const [loading, setLoading] = useState(true)

  // Load data once when the app starts
  useEffect(() => {
    async function load() {
      const list = await getEntities()
      const pairs = await Promise.all(list.map(async (e) => [e.id, await getForecast(e.id)]))
      setEntities(list)
      setForecasts(Object.fromEntries(pairs))
      setLoading(false)
    }
    load()
  }, [])

  // ADMIN sees every entity, USER sees only their own
  const visibleEntities = useMemo(() => {
    if (!user) return []
    if (user.role === 'ADMIN') return entities
    return entities.filter((e) => e.id === user.entity)
  }, [user, entities])

  const summaries = useMemo(
    () => visibleEntities
      .filter((e) => forecasts[e.id])
      .map((e) => summarize(e, forecasts[e.id], thresholds[e.currency])),
    [visibleEntities, forecasts, thresholds]
  )

  const value = {
    user, setUser, entities, visibleEntities, forecasts,
    thresholds, setThresholds, selectedId, setSelectedId, summaries, loading,
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)