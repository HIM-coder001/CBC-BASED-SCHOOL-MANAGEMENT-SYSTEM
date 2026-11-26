import ProtectedRoute from './ProtectedRoute'

export default function RoleRoute({ roles, children }) {
  return <ProtectedRoute requiredRoles={roles}>{children}</ProtectedRoute>
}
