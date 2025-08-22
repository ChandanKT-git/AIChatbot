import { useAuthenticationStatus } from '@nhost/react'
import { Navigate, useLocation } from 'react-router-dom'

export default function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuthenticationStatus()
  const location = useLocation()
  if (isLoading) return <div style={{ padding: 24 }}>Loading...</div>
  if (!isAuthenticated) return <Navigate to="/auth" state={{ from: location }} replace />
  return children
}



