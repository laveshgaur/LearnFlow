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
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.username && typeof parsed.password === 'string') {
      return {
        username: parsed.username,
        password: parsed.password,
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

  const login = useCallback((username, password, roles = []) => {
    const next = { username, password, roles: normalizeRoles(roles) }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setCredentials(next)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setCredentials(null)
  }, [])

  /** Re-fetch roles from PUT /user (same as profile sync). */
  const refreshRoles = useCallback(async () => {
    if (!credentials?.username || !credentials?.password) return
    const auth = { username: credentials.username, password: credentials.password }
    try {
      const profile = await getProfile(auth)
      const roles = normalizeRoles(profile?.roles)
      const next = { ...credentials, roles }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setCredentials(next)
    } catch {
      /* ignore */
    }
  }, [credentials])

  const isInstructor = isInstructorRoles(credentials?.roles)

  const value = useMemo(
    () => ({
      credentials,
      isAuthenticated: Boolean(credentials?.username),
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
