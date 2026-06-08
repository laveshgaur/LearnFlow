import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  deleteInstructorCourse,
  getInstructorCourses,
  updateInstructorCourse,
  uploadCoverImage,
} from '../api/client.js'

function courseToForm(c) {
  return {
    courseId: c.courseId,
    courseName: c.courseName ?? '',
    courseDescription: c.courseDescription ?? '',
    courseDuration: c.courseDuration ?? '',
    coursePrice: c.coursePrice ?? '',
    courseImage: c.courseImage ?? '',
    courseStatus: c.courseStatus ?? 'DRAFT',
  }
}

export default function Studio() {
  const { credentials, isAuthenticated, refreshRoles } = useAuth()
  const [list, setList] = useState(null)
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [editBusy, setEditBusy] = useState(false)

  // Cover upload in edit modal
  const [editCoverUploading, setEditCoverUploading] = useState(false)
  const [editCoverProgress, setEditCoverProgress] = useState(0)

  const load = useCallback(async () => {
    if (!credentials) return
    setError('')
    setForbidden(false)
    setLoading(true)
    try {
      const data = await getInstructorCourses(credentials.token)
      setList(Array.isArray(data) ? data : [])
    } catch (e) {
      if (e.status === 403 || e.status === 401) {
        setForbidden(true)
        setList([])
      } else {
        setError(e.message || 'Could not load your courses.')
        setList([])
      }
    } finally {
      setLoading(false)
    }
  }, [credentials])

  useEffect(() => {
    if (!isAuthenticated || !credentials) return
    load()
  }, [isAuthenticated, credentials, load])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/studio' }} />
  }

  function onEditChange(e) {
    const { name, value } = e.target
    setEditing((f) => (f ? { ...f, [name]: value } : f))
  }

  async function onEditSave(e) {
    e.preventDefault()
    if (!editing) return
    setEditBusy(true)
    try {
      const body = {
        courseName: editing.courseName.trim(),
        courseDescription: editing.courseDescription.trim(),
        courseDuration: editing.courseDuration.trim(),
        coursePrice: editing.coursePrice.trim(),
        courseImage:
          editing.courseImage.trim() || 'https://placehold.co/800x500/1e1830/e8a838?text=Course',
        courseStatus: editing.courseStatus.trim(),
      }
      await updateInstructorCourse(credentials.token, editing.courseId, body)
      setEditing(null)
      await load()
    } catch (e) {
      setError(e.message || 'Update failed.')
    } finally {
      setEditBusy(false)
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Delete this course? This cannot be undone.')) return
    try {
      await deleteInstructorCourse(credentials.token, id)
      await load()
    } catch (e) {
      setError(e.status === 403 ? 'Not allowed to delete this course.' : e.message || 'Delete failed.')
    }
  }

  return (
    <div className="page-wide studio-page">
      <header className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Instructor Studio</h1>
            <p className="lede">
              Create, edit, and manage your courses and content.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/studio/new" className="btn btn-primary">
              + New Course
            </Link>
            <span className="badge-role badge-role-inst">ROLE_INSTRUCTOR</span>
          </div>
        </div>
      </header>

      {forbidden ? (
        <div className="card card-ghost studio-gate">
          <h2>Access restricted</h2>
          <p className="muted">
            Spring Security requires <strong>ROLE_INSTRUCTOR</strong> for <code>/instructor/**</code>. Your session may
            still show only USER — ask an admin to add INSTRUCTOR to your account, then refresh roles.
          </p>
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={() => refreshRoles().then(() => load())}>
              Refresh roles & retry
            </button>
            <Link to="/dashboard" className="btn btn-secondary">
              Dashboard
            </Link>
          </div>
        </div>
      ) : null}

      {!forbidden ? (
        <section className="card" style={{ marginTop: '1rem' }}>
          <div className="panel-head">
            <h2>Your Courses</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
              {loading ? 'Loading…' : 'Reload'}
            </button>
          </div>
          {error ? <div className="alert alert-error">{error}</div> : null}
          {!loading && list && list.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem 1.5rem' }}>
              <div className="empty-icon">📚</div>
              <p className="muted">No courses yet — click <strong>+ New Course</strong> above to get started.</p>
            </div>
          ) : null}
          {list && list.length > 0 ? (
            <div className="table-wrap studio-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {list.map((c) => (
                    <tr key={c.courseId}>
                      <td>
                        <strong>{c.courseName}</strong>
                        <div className="muted table-sub">{c.courseDuration}</div>
                      </td>
                      <td>
                        <span className="tag tag-outline">{c.courseStatus}</span>
                      </td>
                      <td>{c.coursePrice}</td>
                      <td className="table-actions">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(courseToForm(c))}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm danger-text" onClick={() => onDelete(c.courseId)}>
                          Delete
                        </button>
                        <Link to={`/studio/course/${c.courseId}`} className="btn btn-ghost btn-sm">
                          Manage Content
                        </Link>
                        <Link to={`/studio/course/${c.courseId}/analytics`} className="btn btn-ghost btn-sm">
                          📊 Analytics
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* ─── Edit Course Modal ─── */}
      {editing ? (
        <div className="modal-root" role="dialog" aria-modal="true" aria-labelledby="edit-course-title">
          <button type="button" className="modal-scrim" aria-label="Close" onClick={() => setEditing(null)} />
          <div className="modal-card card">
            <h2 id="edit-course-title">Edit course</h2>
            <p className="muted modal-meta">Update course details below.</p>
            <form className="form-grid" onSubmit={onEditSave}>
              <div>
                <label className="label" htmlFor="ed-name">Title</label>
                <input id="ed-name" name="courseName" className="input" required
                  value={editing.courseName} onChange={onEditChange} />
              </div>
              <div>
                <label className="label" htmlFor="ed-status">Status</label>
                <select id="ed-status" name="courseStatus" className="select"
                  value={editing.courseStatus} onChange={onEditChange}>
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="ed-desc">Description</label>
                <textarea id="ed-desc" name="courseDescription" className="textarea" required
                  value={editing.courseDescription} onChange={onEditChange} />
              </div>
              <div className="form-grid-2">
                <div>
                  <label className="label" htmlFor="ed-dur">Duration</label>
                  <input id="ed-dur" name="courseDuration" className="input" required
                    value={editing.courseDuration} onChange={onEditChange} />
                </div>
                <div>
                  <label className="label" htmlFor="ed-price">Price</label>
                  <input id="ed-price" name="coursePrice" className="input" required
                    value={editing.coursePrice} onChange={onEditChange} />
                </div>
              </div>
              <div>
                <label className="label">Cover Image</label>
                {editing.courseImage && (
                  <div style={{ marginBottom: '0.5rem', borderRadius: '8px', overflow: 'hidden', maxHeight: '140px' }}>
                    <img src={editing.courseImage} alt="Cover preview"
                      style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} />
                  </div>
                )}
                <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', gap: '0.4rem' }}>
                  {editCoverUploading ? `Uploading… ${editCoverProgress}%` : (editing.courseImage ? '🔄 Change Image' : '📷 Upload Cover Image')}
                  <input type="file" accept="image/*" style={{ display: 'none' }}
                    disabled={editCoverUploading}
                    onChange={async (e) => {
                      const file = e.target.files[0]
                      if (!file) return
                      setEditCoverUploading(true)
                      setEditCoverProgress(0)
                      try {
                        const res = await uploadCoverImage(credentials.token, file, p => setEditCoverProgress(p))
                        setEditing(f => f ? { ...f, courseImage: res.url } : f)
                      } catch (err) {
                        setError(err.message || 'Cover upload failed')
                      } finally {
                        setEditCoverUploading(false)
                        setEditCoverProgress(0)
                        e.target.value = ''
                      }
                    }}
                  />
                </label>
                {editCoverUploading && (
                  <div style={{ marginTop: '0.35rem', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${editCoverProgress}%`, background: 'linear-gradient(90deg, var(--indigo), var(--emerald))', borderRadius: '2px', transition: 'width 0.3s ease' }} />
                  </div>
                )}
              </div>
              <div className="actions">
                <button type="submit" className="btn btn-primary" disabled={editBusy}>
                  {editBusy ? 'Saving…' : 'Save changes'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
