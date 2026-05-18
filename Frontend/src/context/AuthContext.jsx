import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { getProfile } from '../api/client.js'

const STORAGE_KEY = 'learnflow_auth'

function normalizeRoles(roles) {
  if (!Array.isArray(roles)) return []
  return roles.map((r) => String(r))
}

function isInstructorRoles(roles) {
  return normalizeRoles(roles).some((r) => r.toUpperCase() === 'INSTRUCTOR')
}

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.token && typeof parsed.token === 'string') {
      return {
        username: parsed.username,
        token: parsed.token,
        roles: normalizeRoles(parsed.roles),
      }
    }
  } catch {
    /* ignore */
  }
  return null
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [credentials, setCredentials] = useState(() => readStored())

  const login = useCallback((username, token, roles = []) => {
    const next = { username, token, roles: normalizeRoles(roles) }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setCredentials(next)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setCredentials(null)
  }, [])

  /** Re-fetch roles from PUT /user using the stored JWT token. */
  const refreshRoles = useCallback(async () => {
    if (!credentials?.token) return
    try {
      const profile = await getProfile(credentials.token)
      const roles = normalizeRoles(profile?.roles)
      const next = { ...credentials, roles }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setCredentials(next)
    } catch {
      /* ignore */
    }
  }, [credentials])

  const isInstructor = isInstructorRoles(credentials?.roles)

  const value = useMemo(
    () => ({
      credentials,
      isAuthenticated: Boolean(credentials?.token),
      isInstructor,
      login,
      logout,
      refreshRoles,
    }),
    [credentials, isInstructor, login, logout, refreshRoles],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
