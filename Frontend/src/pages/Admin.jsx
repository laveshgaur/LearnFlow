import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { listUsersAdmin, createUserAdmin, deleteUserAdmin } from '../api/client.js'

export default function Admin() {
  const { credentials, isAuthenticated } = useAuth()
  const [users, setUsers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [empty, setEmpty] = useState(false)

  // New user form state
  const [newUser, setNewUser] = useState({ userName: '', email: '', password: '', age: '', roles: 'USER' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const fetchUsers = async () => {
    setError('')
    setEmpty(false)
    setLoading(true)
    try {
      const data = await listUsersAdmin(credentials.token)
      if (Array.isArray(data)) {
        setUsers(data)
        setEmpty(data.length === 0)
      } else {
        setUsers([])
        setEmpty(true)
      }
    } catch (e) {
      if (e.status === 403 || e.status === 401) {
        setError('You need the ADMIN role to list users.')
      } else {
        setError(e.message || 'Could not load users.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated || !credentials) {
      setLoading(false)
      return
    }
    fetchUsers()
  }, [isAuthenticated, credentials])

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setCreating(true)
    setCreateError('')
    setCreateSuccess('')
    try {
      const payload = {
        ...newUser,
        age: parseInt(newUser.age, 10) || 0,
        roles: newUser.roles.split(',').map(r => r.trim()).filter(Boolean)
      }
      await createUserAdmin(credentials.token, payload)
      setCreateSuccess('User created successfully.')
      setNewUser({ userName: '', email: '', password: '', age: '', roles: 'USER' })
      fetchUsers()
    } catch (err) {
      setCreateError(err.message || 'Error creating user.')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return
    }
    setDeletingId(userId)
    try {
      await deleteUserAdmin(credentials.token, userId)
      fetchUsers()
    } catch (err) {
      const msg = err.body?.error || err.message || 'Error deleting user.'
      alert(msg)
    } finally {
      setDeletingId(null)
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="page-wide">
      <header className="page-header">
        <h1>Administration</h1>
        <p className="lede">
          Manage platform users, create accounts, and oversee the system.
        </p>
      </header>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Create New User</h2>
        {createError && <div className="alert alert-error">{createError}</div>}
        {createSuccess && <div className="alert alert-success">{createSuccess}</div>}

        <form onSubmit={handleCreateUser} style={{ marginTop: '1.25rem' }}>
          <div style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          }}>
            <div>
              <label className="label" htmlFor="au-username">Username</label>
              <input
                id="au-username"
                type="text"
                className="input"
                value={newUser.userName}
                onChange={e => setNewUser({ ...newUser, userName: e.target.value })}
                required
                placeholder="john_doe"
              />
            </div>

            <div>
              <label className="label" htmlFor="au-email">Email</label>
              <input
                id="au-email"
                type="email"
                className="input"
                value={newUser.email}
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                required
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="label" htmlFor="au-password">Password</label>
              <input
                id="au-password"
                type="password"
                className="input"
                value={newUser.password}
                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                required
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="label" htmlFor="au-age">Age</label>
              <input
                id="au-age"
                type="number"
                className="input"
                value={newUser.age}
                onChange={e => setNewUser({ ...newUser, age: e.target.value })}
                required
                min={1}
                placeholder="25"
              />
            </div>

            <div>
              <label className="label" htmlFor="au-roles">Role</label>
              <select
                id="au-roles"
                className="select"
                value={newUser.roles}
                onChange={e => setNewUser({ ...newUser, roles: e.target.value })}
              >
                <option value="USER">USER</option>
                <option value="INSTRUCTOR">INSTRUCTOR</option>
                <option value="ADMIN">ADMIN</option>
                <option value="USER,INSTRUCTOR">USER + INSTRUCTOR</option>
                <option value="USER,ADMIN">USER + ADMIN</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={creating}
            style={{ marginTop: '1.25rem', width: '100%' }}
          >
            {creating ? 'Creating…' : '+ Create User'}
          </button>
        </form>
      </div>

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
                  <th>Enrolled</th>
                  <th>Created</th>
                  <th>Actions</th>
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
                    <td>{Array.isArray(u.enrolledCourses) ? u.enrolledCourses.length : 0}</td>
                    <td>{Array.isArray(u.courses) ? u.courses.length : 0}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={deletingId === u.id || u.userName === credentials?.username}
                        title={u.userName === credentials?.username ? 'Cannot delete yourself' : `Delete ${u.userName}`}
                        onClick={() => handleDeleteUser(u.id, u.userName)}
                      >
                        {deletingId === u.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
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
