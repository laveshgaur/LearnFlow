import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { listUsersAdmin, createUserAdmin } from '../api/client.js'

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

  const fetchUsers = async () => {
    setError('')
    setEmpty(false)
    setLoading(true)
    try {
      const data = await listUsersAdmin(credentials)
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
      await createUserAdmin(credentials, payload)
      setCreateSuccess('User created successfully.')
      setNewUser({ userName: '', email: '', password: '', age: '', roles: 'USER' })
      fetchUsers()
    } catch (err) {
      setCreateError(err.message || 'Error creating user.')
    } finally {
      setCreating(false)
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
          <code>GET /admin</code> — requires <code>ROLE_ADMIN</code> on the server.
        </p>
      </header>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Create New User</h2>
        {createError && <div className="alert alert-error">{createError}</div>}
        {createSuccess && <div className="alert alert-success">{createSuccess}</div>}
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', marginTop: '1rem' }}>
          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Username</label>
            <input 
              type="text" 
              className="form-control" 
              value={newUser.userName} 
              onChange={e => setNewUser({ ...newUser, userName: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Email</label>
            <input 
              type="email" 
              className="form-control" 
              value={newUser.email} 
              onChange={e => setNewUser({ ...newUser, email: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={newUser.password} 
              onChange={e => setNewUser({ ...newUser, password: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group" style={{ flex: '1 1 80px' }}>
            <label>Age</label>
            <input 
              type="number" 
              className="form-control" 
              value={newUser.age} 
              onChange={e => setNewUser({ ...newUser, age: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Roles (comma separated)</label>
            <input 
              type="text" 
              className="form-control" 
              value={newUser.roles} 
              onChange={e => setNewUser({ ...newUser, roles: e.target.value })} 
              placeholder="USER, ADMIN, INSTRUCTOR" 
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={creating}>
            {creating ? 'Creating...' : 'Create User'}
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
