import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserPublic } from '../api/client.js'

const initial = { userName: '', email: '', age: '', password: '' }

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  function onChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const ageNum = parseInt(String(form.age), 10)
      if (Number.isNaN(ageNum) || ageNum < 1) {
        setError('Please enter a valid age.')
        setLoading(false)
        return
      }
      await createUserPublic({
        userName: form.userName.trim(),
        email: form.email.trim(),
        age: ageNum,
        password: form.password,
      })
      setDone(true)
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      const msg =
        err.status === 403 || err.status === 401
          ? 'Registration was blocked. Check API security rules.'
          : typeof err.body === 'object' && err.body?.message
            ? err.body.message
            : err.message || 'Could not create account.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-panel card card-ghost">
        <header className="page-header" style={{ marginBottom: '1.25rem' }}>
          <h1>Register</h1>
          <p className="lede">Open sign-up via <code>POST /create-user</code>.</p>
        </header>

        <form className="form-grid" onSubmit={onSubmit}>
          <div>
            <label className="label" htmlFor="userName">
              Username
            </label>
            <input
              id="userName"
              name="userName"
              className="input"
              autoComplete="username"
              required
              value={form.userName}
              onChange={onChange}
            />
          </div>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              autoComplete="email"
              required
              value={form.email}
              onChange={onChange}
            />
          </div>
          <div>
            <label className="label" htmlFor="age">
              Age
            </label>
            <input
              id="age"
              name="age"
              type="number"
              min={1}
              className="input"
              required
              value={form.age}
              onChange={onChange}
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={onChange}
            />
          </div>
          <div className="actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create account'}
            </button>
            <Link to="/login" className="btn btn-ghost">
              Have an account? Log in
            </Link>
          </div>
        </form>
        {error ? <div className="alert alert-error">{error}</div> : null}
        {done ? <div className="alert alert-success">Account created. Redirecting…</div> : null}
      </div>
    </div>
  )
}
