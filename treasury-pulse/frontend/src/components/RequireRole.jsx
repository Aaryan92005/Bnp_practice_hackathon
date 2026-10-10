import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function RequireRole({ roles, children }) {
  const { user } = useApp()
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}