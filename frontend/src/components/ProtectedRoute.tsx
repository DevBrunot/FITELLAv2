import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { Role } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole: Role
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={requiredRole === 'trainer' ? '/trainer/login' : '/student/login'} replace />
  }

  if (role !== requiredRole) {
    return <Navigate to={role === 'trainer' ? '/trainer/dashboard' : '/student/workouts'} replace />
  }

  return <>{children}</>
}
