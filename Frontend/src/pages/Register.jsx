import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserPublic } from '../api/client.js'

const initial = { userName: '', email: '', age: '', password: '' }

const RULES = [
  'Min 8 characters',
  'At least one uppercase (A–Z)',
  'At least one lowercase (a–z)',
  'At least one number (0–9)',
  'At least one symbol (!@#$%…)',
]

function PasswordRule({ met, text }) {
  return (
    <li style={{
      display: 'flex', alignItems: 'center', gap: '0.4rem',
      fontSize: '0.75rem',
      color: met ? 'var(--emerald)' : 'var(--text-dim)',
      transition: 'color 0.2s',
    }}>
      <span>{met ? '✓' : '○'}</span> {text}
    </li>
  )
}

function checkRules(pw) {
  return [
    pw.length >= 8,
    /[A-Z]/.test(pw),
    /[a-z]/.test(pw),
    /[0-9]/.test(pw),
    /[!@#$%^&*()]/.test(pw),
  ]
}

export default function Register() {
  const navigate = useNavigate()
  const [form,    setForm]    = useState(initial)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [done,    setDone]    = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [pwFocus, setPwFocus]   = useState(false)

  const rulesMet = checkRules(form.password)
  const allRulesMet = rulesMet.every(Boolean)

  function onChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
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
      if (!allRulesMet) {
        setError('Password does not meet the requirements.')
        setLoading(false)
        return
      }
      await createUserPublic({
        userName: form.userName.trim(),
        email:    form.email.trim(),
        age:      ageNum,
        password: form.password,
      })
      setDone(true)
      setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      const msg =
        typeof err.body === 'object' && err.body?.message
          ? err.body.message
          : err.status === 400
            ? 'Some fields are invalid. Check your username, email, or password format.'
            : err.message || 'Could not create account. Try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-panel card">
        <div className="auth-logo">
          <svg className="auth-logo-glyph" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <defs>
              <linearGradient id="reg-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1a1035"/>
                <stop offset="100%" stopColor="#0d0d1a"/>
              </linearGradient>
              <linearGradient id="reg-accent" x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#818cf8"/>
                <stop offset="50%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#a78bfa"/>
              </linearGradient>
              <linearGradient id="reg-flow" x1="18" y1="10" x2="26" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#22d3ee"/>
                <stop offset="100%" stopColor="#6366f1"/>
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#reg-bg)"/>
            <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none"/>
            <path d="M7 8v16h9" stroke="url(#reg-accent)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M19 24V8h8M19 15.5h6" stroke="url(#reg-flow)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="27" cy="8" r="1.8" fill="#22d3ee" opacity="0.9"/>
            <circle cx="27" cy="8" r="3" fill="#22d3ee" opacity="0.2"/>
          </svg>
          LearnFlow
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Join for free and start learning today</p>

        <form className="form-grid" onSubmit={onSubmit}>
          <div className="form-grid-2">
            <div>
              <label className="label" htmlFor="userName">Username</label>
              <input
                id="userName" name="userName"
                className="input"
                autoComplete="username"
                placeholder="coollearner"
                required
                value={form.userName}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="label" htmlFor="age">Age</label>
              <input
                id="age" name="age"
                type="number" min={18}
                className="input"
                placeholder="25"
                required
                value={form.age}
                onChange={onChange}
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="email">Email address</label>
            <input
              id="email" name="email"
              type="email"
              className="input"
              autoComplete="email"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password" name="password"
                type={showPass ? 'text' : 'password'}
                className="input"
                autoComplete="new-password"
                placeholder="Create a strong password"
                required
                value={form.password}
                onChange={onChange}
                onFocus={() => setPwFocus(true)}
                onBlur={() => setPwFocus(false)}
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: '0.85rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                  fontSize: '0.8rem', padding: 0,
                }}
              >
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
            {/* Password rules — shown when field is focused or has a value */}
            {(pwFocus || form.password) && (
              <ul style={{ listStyle: 'none', padding: '0.6rem 0 0', margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 0.5rem' }}>
                {RULES.map((rule, i) => (
                  <PasswordRule key={rule} met={rulesMet[i]} text={rule} />
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading || done}
            style={{ width: '100%', marginTop: '0.25rem' }}
          >
            {done ? '✓ Account created!' : loading ? 'Creating…' : 'Create account →'}
          </button>
        </form>

        {error && <div className="alert alert-error">⚠ {error}</div>}
        {done  && <div className="alert alert-success">🎉 Account created! Redirecting to login…</div>}

        <p className="auth-footer-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
