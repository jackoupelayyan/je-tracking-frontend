import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  role: 'ORG' | 'SUPER_ADMIN'
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { isAuthenticated, role: userRole } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (userRole !== role) return <Navigate to="/login" replace />
  return <>{children}</>
}
