import { createContext, useContext, useState, type ReactNode } from 'react'
import { login as apiLogin } from '../api/client'

interface AuthContextType {
  token: string | null
  role: string | null
  orgName: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'))
  const [orgName, setOrgName] = useState<string | null>(localStorage.getItem('orgName'))

  const login = async (username: string, password: string) => {
    const data = await apiLogin(username, password)
    localStorage.setItem('token', data.token)
    localStorage.setItem('role', data.role)
    if (data.orgName) localStorage.setItem('orgName', data.orgName)
    setToken(data.token)
    setRole(data.role)
    setOrgName(data.orgName)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('orgName')
    setToken(null)
    setRole(null)
    setOrgName(null)
  }

  return (
    <AuthContext.Provider value={{ token, role, orgName, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
