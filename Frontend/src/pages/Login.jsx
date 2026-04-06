import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getProfile, healthCheck } from '../api/client.js'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const auth = { username: username.trim(), password }
    try {
      await healthCheck(auth)
      const profile = await getProfile(auth)
      const roles = Array.isArray(profile?.roles) ? profile.roles : []
      login(auth.username, auth.password, roles)
      navigate(from, { replace: true })
    } catch {
      setError('Invalid username or password, or API unreachable.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-panel card card-ghost">
        <header className="page-header" style={{ marginBottom: '1.25rem' }}>
          <h1>Log in</h1>
          <p className="lede">HTTP Basic auth. We load your roles from <code>PUT /user</code> after sign-in.</p>
        </header>

        <form className="form-grid" onSubmit={onSubmit}>
          <div>
            <label className="label" htmlFor="login-user">
              Username
            </label>
            <input
              id="login-user"
              className="input"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="login-pass">
              Password
            </label>
            <input
              id="login-pass"
              type="password"
              className="input"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <Link to="/register" className="btn btn-ghost">
              New here? Register
            </Link>
          </div>
        </form>
        {error ? <div className="alert alert-error">{error}</div> : null}
      </div>
    </div>
  )
}
