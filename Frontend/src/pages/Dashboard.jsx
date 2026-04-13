import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getProfile, healthCheck } from '../api/client.js'

function ProfileSummary({ user }) {
  if (!user) return <p className="muted">No profile loaded.</p>
  const roles = Array.isArray(user.roles) ? user.roles.join(', ') : '—'
  const courses = Array.isArray(user.courses) ? user.courses : []
  return (
    <>
    <dl className="profile-grid">
      <dt>Username</dt>
      <dd>{user.userName ?? '—'}</dd>
      <dt>Email</dt>
      <dd>{user.email ?? '—'}</dd>
      <dt>Age</dt>
      <dd>{user.age ?? '—'}</dd>
      <dt>Roles</dt>
      <dd>
        <span className="tag tag-outline">{roles}</span>
      </dd>
    </dl>
    {courses.length > 0 && (
      <div style={{ marginTop: '1rem' }}>
        <h3>Your Courses</h3>
        <ul className="stack">
          {courses.map(c => (
            <li key={c.courseId} className="card card-ghost" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{c.courseName}</span>
              <Link to={`/course/${c.courseId}`} className="btn btn-primary btn-sm">
                Study
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )}
    </>
  )
}

export default function Dashboard() {
  const { credentials, isAuthenticated, isInstructor, refreshRoles } = useAuth()
  const [health, setHealth] = useState('')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !credentials) {
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      setError('')
      setLoading(true)
      try {
        const h = await healthCheck(credentials)
        if (!cancelled) setHealth(typeof h === 'string' ? h : JSON.stringify(h))
        const p = await getProfile(credentials)
        if (!cancelled) setProfile(p)
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load dashboard data.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, credentials])

  async function onRefreshRoles() {
    setRefreshing(true)
    try {
      await refreshRoles()
    } finally {
      setRefreshing(false)
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="page-wide">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p className="lede">
          Signed in as <strong>{credentials.username}</strong>. Profile sync uses <code>PUT /user</code>. Enroll from the{' '}
          <Link to="/courses">catalog</Link> via <code>POST /user/purchase-course/&#123;id&#125;</code>.
        </p>
      </header>

      <div className="stack">
        <div className="stats-row" style={{ marginTop: 0 }}>
          <div className="stat-tile">
            <p className="value">{loading ? '…' : health || '—'}</p>
            <p className="label muted">API health</p>
          </div>
          <div className="stat-tile">
            <p className="value">{profile && Array.isArray(profile.courses) ? profile.courses.length : '—'}</p>
            <p className="label muted">Courses on your profile</p>
          </div>
          <div className="stat-tile">
            <p className="value">{isInstructor ? 'Yes' : 'No'}</p>
            <p className="label muted">Instructor (session)</p>
          </div>
        </div>

        <div className="actions dash-actions">
          <Link to="/courses" className="btn btn-primary">
            Browse catalog
          </Link>
          {isInstructor ? (
            <Link to="/studio" className="btn btn-secondary">
              Instructor studio
            </Link>
          ) : null}
          <button type="button" className="btn btn-ghost" onClick={onRefreshRoles} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh roles from server'}
          </button>
        </div>

        <div className="card">
          <h2>Profile</h2>
          {loading ? <p className="muted">Loading…</p> : <ProfileSummary user={profile} />}
          <p className="muted footnote">
            If an admin added <code>INSTRUCTOR</code>, click <strong>Refresh roles</strong> so the sidebar shows{' '}
            <em>Instructor studio</em>.
          </p>
        </div>

        {error ? <div className="alert alert-error">{error}</div> : null}
      </div>
    </div>
  )
}
