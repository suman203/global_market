import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from '../api/endpoints'
import type { LoginPayload, RegisterPayload, User } from '../types/api'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<User>
  logout: () => Promise<void>
  register: (payload: RegisterPayload) => Promise<User>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const me = await api.auth.me()
      setUser(me)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    api.auth
      .me()
      .then((me) => {
        if (!cancelled) setUser(me)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const loggedIn = await api.auth.login(payload)
    setUser(loggedIn)
    return loggedIn
  }, [])

  const logout = useCallback(async () => {
    await api.auth.logout()
    setUser(null)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const registered = await api.auth.register(payload)
    setUser(registered)
    return registered
  }, [])

  const value = useMemo(
    () => ({ user, isLoading, login, logout, register, refresh }),
    [user, isLoading, login, logout, register, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
