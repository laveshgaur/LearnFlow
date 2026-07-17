import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const STORAGE_KEY = 'learnflow_theme'

/**
 * Theme preference: 'system' | 'light' | 'dark'
 * Resolved theme: 'light' | 'dark' (what's actually applied)
 */

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readStoredPreference() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch { /* ignore */ }
  return 'system'
}

function resolveTheme(preference) {
  if (preference === 'system') return getSystemTheme()
  return preference
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(() => readStoredPreference())
  const [resolved, setResolved] = useState(() => resolveTheme(readStoredPreference()))

  // Apply theme to DOM
  useEffect(() => {
    const theme = resolveTheme(preference)
    setResolved(theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [preference])

  // Listen for system theme changes when preference is 'system'
  useEffect(() => {
    if (preference !== 'system') return

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => {
      const theme = e.matches ? 'dark' : 'light'
      setResolved(theme)
      document.documentElement.setAttribute('data-theme', theme)
    }
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [preference])

  const setPreference = useCallback((pref) => {
    localStorage.setItem(STORAGE_KEY, pref)
    setPreferenceState(pref)
  }, [])

  /** Cycle through: system → light → dark → system */
  const cycleTheme = useCallback(() => {
    setPreference(
      preference === 'system' ? 'light'
        : preference === 'light' ? 'dark'
          : 'system'
    )
  }, [preference, setPreference])

  const value = useMemo(() => ({
    preference,    // 'system' | 'light' | 'dark'
    resolved,      // 'light' | 'dark'
    setPreference,
    cycleTheme,
  }), [preference, resolved, setPreference, cycleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
