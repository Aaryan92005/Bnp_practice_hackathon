import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import RequireRole from './components/RequireRole'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import LiquidityGap from './pages/LiquidityGap'
import Alerts from './pages/Alerts'
import WhatIf from './pages/WhatIf'
import Transactions from './pages/Transactions'
import Reports from './pages/Reports'
import Chat from './pages/Chat'
import Settings from './pages/Settings'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="gap" element={<LiquidityGap />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="whatif" element={<WhatIf />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="reports" element={<Reports />} />
            <Route path="chat" element={<Chat />} />
            <Route
              path="settings"
              element={
                <RequireRole roles={['ADMIN']}>
                  <Settings />
                </RequireRole>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}