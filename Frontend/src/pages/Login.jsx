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
          <span className="auth-logo-glyph" />
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
