import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { loginUser, getProfile } from '../api/client.js'

export default function Login() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const from = location.state?.from || '/dashboard'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [showPass, setShowPass] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Step 1: POST /login → get JWT token
      const token = await loginUser(username.trim(), password)

      // Step 2: fetch profile using the token to get roles
      const profile = await getProfile(token)
      const roles   = Array.isArray(profile?.roles) ? profile.roles : []

      // Step 3: store username + token + roles in context/session
      login(username.trim(), token, roles)
      navigate(from, { replace: true })
    } catch {
      setError('Invalid username or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-panel card">
        {/* Logo */}
        <div className="auth-logo">
          <svg className="auth-logo-glyph" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <defs>
              <linearGradient id="auth-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1a1035"/>
                <stop offset="100%" stopColor="#0d0d1a"/>
              </linearGradient>
              <linearGradient id="auth-accent" x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#818cf8"/>
                <stop offset="50%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#a78bfa"/>
              </linearGradient>
              <linearGradient id="auth-flow" x1="18" y1="10" x2="26" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#22d3ee"/>
                <stop offset="100%" stopColor="#6366f1"/>
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#auth-bg)"/>
            <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none"/>
            <path d="M7 8v16h9" stroke="url(#auth-accent)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M19 24V8h8M19 15.5h6" stroke="url(#auth-flow)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="27" cy="8" r="1.8" fill="#22d3ee" opacity="0.9"/>
            <circle cx="27" cy="8" r="3" fill="#22d3ee" opacity="0.2"/>
          </svg>
          LearnFlow
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to continue learning</p>

        <form className="form-grid" onSubmit={onSubmit}>
          <div>
            <label className="label" htmlFor="login-user">Username</label>
            <input
              id="login-user"
              className="input"
              autoComplete="username"
              placeholder="your_username"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="login-pass">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-pass"
                type={showPass ? 'text' : 'password'}
                className="input"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: '0.85rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                  fontSize: '0.8rem', padding: '0',
                }}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.25rem' }}
          >
            {loading ? (
              <>
                <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite', fontSize: '1.1em' }}>◌</span>
                Signing in…
              </>
            ) : 'Sign in →'}
          </button>
        </form>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <p className="auth-footer-link">
          New to LearnFlow? <Link to="/register">Create a free account</Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
