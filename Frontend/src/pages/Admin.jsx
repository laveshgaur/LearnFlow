import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { listUsersAdmin } from '../api/client.js'

export default function Admin() {
  const { credentials, isAuthenticated } = useAuth()
  const [users, setUsers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [empty, setEmpty] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !credentials) {
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      setError('')
      setEmpty(false)
      setLoading(true)
      try {
        const data = await listUsersAdmin(credentials)
        if (!cancelled) {
          if (Array.isArray(data)) {
            setUsers(data)
            setEmpty(data.length === 0)
          } else {
            setUsers([])
            setEmpty(true)
          }
        }
      } catch (e) {
        if (e.status === 403 || e.status === 401) {
          if (!cancelled) setError('You need the ADMIN role to list users.')
        } else {
          if (!cancelled) setError(e.message || 'Could not load users.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, credentials])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="page-wide">
      <header className="page-header">
        <h1>Administration</h1>
        <p className="lede">
          <code>GET /admin</code> — requires <code>ROLE_ADMIN</code> on the server.
        </p>
      </header>

      <div className="card">
        {loading ? <p className="muted">Loading directory…</p> : null}
        {error ? <div className="alert alert-error">{error}</div> : null}
        {empty && !error ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <p>No users returned (empty database or 204 from API).</p>
          </div>
        ) : null}
        {users && users.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Age</th>
                  <th>Roles</th>
                  <th>Courses</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id || u.email}>
                    <td>{u.userName}</td>
                    <td>{u.email}</td>
                    <td>{u.age}</td>
                    <td>
                      <span className="tag tag-outline">{Array.isArray(u.roles) ? u.roles.join(', ') : '—'}</span>
                    </td>
                    <td>{Array.isArray(u.courses) ? u.courses.length : '0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  )
}
