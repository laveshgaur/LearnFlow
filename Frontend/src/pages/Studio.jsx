import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  createCourse,
  deleteInstructorCourse,
  getInstructorCourses,
  updateInstructorCourse,
} from '../api/client.js'

const emptyCreate = {
  courseName: '',
  courseDescription: '',
  courseDuration: '',
  coursePrice: '',
  courseImage: '',
  courseStatus: 'DRAFT',
}

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
  const [createForm, setCreateForm] = useState(emptyCreate)
  const [createBusy, setCreateBusy] = useState(false)
  const [createMsg, setCreateMsg] = useState(null)
  const [editing, setEditing] = useState(null)
  const [editBusy, setEditBusy] = useState(false)

  const load = useCallback(async () => {
    if (!credentials) return
    setError('')
    setForbidden(false)
    setLoading(true)
    try {
      const data = await getInstructorCourses(credentials)
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

  function onCreateChange(e) {
    const { name, value } = e.target
    setCreateForm((f) => ({ ...f, [name]: value }))
  }

  async function onCreateSubmit(e) {
    e.preventDefault()
    setCreateMsg(null)
    setCreateBusy(true)
    try {
      const body = {
        courseName: createForm.courseName.trim(),
        courseDescription: createForm.courseDescription.trim(),
        courseDuration: createForm.courseDuration.trim(),
        coursePrice: createForm.coursePrice.trim(),
        courseImage:
          createForm.courseImage.trim() || 'https://placehold.co/800x500/1e1830/e8a838?text=Course',
        courseStatus: createForm.courseStatus.trim(),
      }
      await createCourse(credentials, body)
      setCreateForm(emptyCreate)
      setCreateMsg({ type: 'ok', text: 'Course created.' })
      await load()
    } catch (err) {
      setCreateMsg({
        type: 'err',
        text:
          err.status === 403
            ? 'Forbidden — your account needs the INSTRUCTOR role.'
            : err.message || 'Create failed.',
      })
    } finally {
      setCreateBusy(false)
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Delete this course? This cannot be undone.')) return
    try {
      await deleteInstructorCourse(credentials, id)
      await load()
    } catch (e) {
      setError(e.status === 403 ? 'Not allowed to delete this course.' : e.message || 'Delete failed.')
    }
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
      await updateInstructorCourse(credentials, editing.courseId, body)
      setEditing(null)
      await load()
    } catch (e) {
      setError(e.message || 'Update failed.')
    } finally {
      setEditBusy(false)
    }
  }

  return (
    <div className="page-wide studio-page">
      <header className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Instructor studio</h1>
            <p className="lede">
              <code>GET /instructor/get-courses</code> · <code>POST /instructor/create-course</code> ·{' '}
              <code>PUT /instructor/update-course/&#123;id&#125;</code> ·{' '}
              <code>DELETE /instructor/delete-course/&#123;id&#125;</code>
            </p>
          </div>
          <span className="badge-role badge-role-inst">ROLE_INSTRUCTOR</span>
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
        <div className="studio-split">
          <section className="card studio-panel">
            <div className="panel-head">
              <h2>Your courses</h2>
              <button type="button" className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
                {loading ? 'Loading…' : 'Reload'}
              </button>
            </div>
            {error ? <div className="alert alert-error">{error}</div> : null}
            {!loading && list && list.length === 0 ? (
              <p className="muted empty-inline">No courses yet — create one with the form on the right.</p>
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>

          <aside className="card card-ghost studio-side">
            <h2>New course</h2>
            <form className="form-grid" onSubmit={onCreateSubmit}>
              <div>
                <label className="label" htmlFor="nc-name">
                  Title
                </label>
                <input
                  id="nc-name"
                  name="courseName"
                  className="input"
                  required
                  value={createForm.courseName}
                  onChange={onCreateChange}
                />
              </div>
              <div>
                <label className="label" htmlFor="nc-status">
                  Status
                </label>
                <select
                  id="nc-status"
                  name="courseStatus"
                  className="select"
                  value={createForm.courseStatus}
                  onChange={onCreateChange}
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="nc-desc">
                  Description
                </label>
                <textarea
                  id="nc-desc"
                  name="courseDescription"
                  className="textarea textarea-sm"
                  required
                  value={createForm.courseDescription}
                  onChange={onCreateChange}
                />
              </div>
              <div>
                <label className="label" htmlFor="nc-dur">
                  Duration
                </label>
                <input
                  id="nc-dur"
                  name="courseDuration"
                  className="input"
                  required
                  value={createForm.courseDuration}
                  onChange={onCreateChange}
                />
              </div>
              <div>
                <label className="label" htmlFor="nc-price">
                  Price
                </label>
                <input
                  id="nc-price"
                  name="coursePrice"
                  className="input"
                  required
                  value={createForm.coursePrice}
                  onChange={onCreateChange}
                />
              </div>
              <div>
                <label className="label" htmlFor="nc-img">
                  Cover URL
                </label>
                <input
                  id="nc-img"
                  name="courseImage"
                  className="input"
                  type="url"
                  value={createForm.courseImage}
                  onChange={onCreateChange}
                  placeholder="Optional"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={createBusy}>
                {createBusy ? 'Saving…' : 'Publish course'}
              </button>
            </form>
            {createMsg?.type === 'ok' ? <div className="alert alert-success">{createMsg.text}</div> : null}
            {createMsg?.type === 'err' ? <div className="alert alert-error">{createMsg.text}</div> : null}
            <Link to="/courses" className="btn btn-secondary studio-catalog-link">
              View public catalog
            </Link>
          </aside>
        </div>
      ) : null}

      {editing ? (
        <div className="modal-root" role="dialog" aria-modal="true" aria-labelledby="edit-course-title">
          <button type="button" className="modal-scrim" aria-label="Close" onClick={() => setEditing(null)} />
          <div className="modal-card card">
            <h2 id="edit-course-title">Edit course</h2>
            <p className="muted modal-meta">
              <code>PUT /instructor/update-course/{editing.courseId}</code>
            </p>
            <form className="form-grid" onSubmit={onEditSave}>
              <div>
                <label className="label" htmlFor="ed-name">
                  Title
                </label>
                <input
                  id="ed-name"
                  name="courseName"
                  className="input"
                  required
                  value={editing.courseName}
                  onChange={onEditChange}
                />
              </div>
              <div>
                <label className="label" htmlFor="ed-status">
                  Status
                </label>
                <select
                  id="ed-status"
                  name="courseStatus"
                  className="select"
                  value={editing.courseStatus}
                  onChange={onEditChange}
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="ed-desc">
                  Description
                </label>
                <textarea
                  id="ed-desc"
                  name="courseDescription"
                  className="textarea"
                  required
                  value={editing.courseDescription}
                  onChange={onEditChange}
                />
              </div>
              <div className="form-grid-2">
                <div>
                  <label className="label" htmlFor="ed-dur">
                    Duration
                  </label>
                  <input
                    id="ed-dur"
                    name="courseDuration"
                    className="input"
                    required
                    value={editing.courseDuration}
                    onChange={onEditChange}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="ed-price">
                    Price
                  </label>
                  <input
                    id="ed-price"
                    name="coursePrice"
                    className="input"
                    required
                    value={editing.coursePrice}
                    onChange={onEditChange}
                  />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="ed-img">
                  Cover URL
                </label>
                <input
                  id="ed-img"
                  name="courseImage"
                  className="input"
                  type="url"
                  value={editing.courseImage}
                  onChange={onEditChange}
                  placeholder="Optional — placeholder if empty"
                />
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
