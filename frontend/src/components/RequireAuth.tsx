import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import type { Role } from '../types/api'

function FullScreenLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold-400/30 border-t-gold-400" />
    </div>
  )
}

export default function RequireAuth({ children, role }: { children: ReactNode; role?: Role }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullScreenLoader />

  if (!user) {
    const from = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?from=${from}`} replace />
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/'} replace />
  }

  return <>{children}</>
}
