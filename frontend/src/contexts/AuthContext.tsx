import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Role } from '@/types'

interface AuthUser {
  id: string
  email: string
  role: Role
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  role: Role | null
  isAuthenticated: boolean
  login: (token: string, role: Role) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function parseJwtPayload(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return { id: payload.sub, email: payload.email, role: payload.role }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('fitela:token'))
  const [user, setUser] = useState<AuthUser | null>(() => {
    const t = localStorage.getItem('fitela:token')
    return t ? parseJwtPayload(t) : null
  })

  const login = useCallback((accessToken: string, role: Role) => {
    localStorage.setItem('fitela:token', accessToken)
    localStorage.setItem('fitela:role', role)
    setToken(accessToken)
    setUser(parseJwtPayload(accessToken))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('fitela:token')
    localStorage.removeItem('fitela:role')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role ?? null,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
