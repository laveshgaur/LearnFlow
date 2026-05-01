import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getProfile, healthCheck } from '../api/client.js'

function ProfileSummary({ user }) {
  if (!user) return <p className="muted">No profile loaded.</p>
  const roles = Array.isArray(user.roles) ? user.roles : []
  const enrolledCourses = Array.isArray(user.enrolledCourses) ? user.enrolledCourses : []

  return (
    <>
      <dl className="profile-grid">
        {[
          ['Username', user.userName ?? '—'],
          ['Email',    user.email    ?? '—'],
          ['Age',      user.age      ?? '—'],
        ].map(([dt, dd]) => (
          <span key={dt} style={{ display: 'contents' }}>
            <dt>{dt}</dt>
            <dd>{dd}</dd>
          </span>
        ))}
        <dt>Roles</dt>
        <dd style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {roles.length
            ? roles.map(r => (
                <span
                  key={r}
                  className={
                    r === 'ADMIN' ? 'tag tag-danger' :
                    r === 'INSTRUCTOR' ? 'tag tag-accent' : 'tag'
                  }
                >
                  {r}
                </span>
              ))
            : <span className="tag tag-outline">—</span>
          }
        </dd>
      </dl>

      {enrolledCourses.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Enrolled Courses</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {enrolledCourses.map(c => (
              <div
                key={c.courseId}
                className="card card-ghost"
                style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: '1rem',
                  padding: '0.9rem 1.1rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{c.courseName}</div>
                  {c.courseDuration && (
                    <div className="muted" style={{ fontSize: '0.78rem', marginTop: '0.15rem' }}>
                      {c.courseDuration}
                    </div>
                  )}
                </div>
                <Link to={`/course/${c.courseId}`} className="btn btn-primary btn-sm">
                  Study →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default function Dashboard() {
  const { credentials, isAuthenticated, isInstructor, refreshRoles } = useAuth()
  const [health,     setHealth]     = useState(null)
  const [profile,    setProfile]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !credentials) { setLoading(false); return }
    let cancelled = false
    ;(async () => {
      setError('')
      setLoading(true)
      try {
        const [h, p] = await Promise.all([healthCheck(credentials), getProfile(credentials)])
        if (!cancelled) { setHealth(h); setProfile(p) }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load dashboard.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [isAuthenticated, credentials])

  async function onRefreshRoles() {
    setRefreshing(true)
    try { await refreshRoles() }
    finally { setRefreshing(false) }
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const enrolled = Array.isArray(profile?.enrolledCourses) ? profile.enrolledCourses.length : '—'

  return (
    <div className="page-wide">
      <header className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Dashboard</h1>
            <p className="lede">
              Welcome back, <strong>{credentials.username}</strong>. Here's your overview.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to="/courses" className="btn btn-primary btn-sm">Browse catalog</Link>
            {isInstructor && (
              <Link to="/studio" className="btn btn-secondary btn-sm">Open Studio</Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Stat tiles ── */}
      <div className="stats-row" style={{ marginTop: 0 }}>
        <div className="stat-tile">
          <p className="value">{loading ? '…' : (health ?? '—')}</p>
          <p className="label">API health</p>
        </div>
        <div className="stat-tile">
          <p className="value">{loading ? '…' : enrolled}</p>
          <p className="label">Enrolled courses</p>
        </div>
        <div className="stat-tile">
          <p className="value">{isInstructor ? '✦' : '—'}</p>
          <p className="label">Instructor access</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'minmax(0,1fr)', marginTop: '0.5rem' }}>
        {/* ── Profile card ── */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 style={{ margin: 0 }}>Profile</h2>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onRefreshRoles}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing…' : '↻ Refresh roles'}
            </button>
          </div>
          {loading
            ? <div className="skeleton" style={{ height: 80 }} />
            : <ProfileSummary user={profile} />
          }
          {!loading && (
            <p className="footnote">
              If an admin granted you <code>INSTRUCTOR</code> access, click <strong>Refresh roles</strong> to update your session.
            </p>
          )}
        </div>

        {error && <div className="alert alert-error">⚠ {error}</div>}
      </div>
    </div>
  )
}
