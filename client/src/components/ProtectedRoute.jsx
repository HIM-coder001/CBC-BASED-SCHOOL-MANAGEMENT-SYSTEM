import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store'

export default function ProtectedRoute({ children, requiredRole = null, requiredRoles = null }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />
  }

  const allowed = requiredRoles ?? (requiredRole ? [requiredRole] : null)
  if (allowed && !allowed.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
