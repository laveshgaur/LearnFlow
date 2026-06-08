import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { createCourse, uploadCoverImage } from '../api/client.js'

export default function CreateCourse() {
  const { credentials, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    courseName: '',
    courseDescription: '',
    courseDuration: '',
    coursePrice: '',
    courseImage: '',
    courseStatus: 'DRAFT',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [coverUploading, setCoverUploading] = useState(false)
  const [coverProgress, setCoverProgress] = useState(0)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  function onChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleCoverUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setCoverUploading(true)
    setCoverProgress(0)
    try {
      const res = await uploadCoverImage(credentials.token, file, p => setCoverProgress(p))
      setForm(f => ({ ...f, courseImage: res.url }))
    } catch (err) {
      setError(err.message || 'Cover upload failed')
    } finally {
      setCoverUploading(false)
      setCoverProgress(0)
      e.target.value = ''
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const body = {
        courseName: form.courseName.trim(),
        courseDescription: form.courseDescription.trim(),
        courseDuration: form.courseDuration.trim(),
        coursePrice: form.coursePrice.trim(),
        courseImage: form.courseImage.trim() || 'https://placehold.co/800x500/1e1830/e8a838?text=Course',
        courseStatus: form.courseStatus.trim(),
      }
      await createCourse(credentials.token, body)
      navigate('/studio')
    } catch (err) {
      setError(
        err.status === 403
          ? 'Forbidden — your account needs the INSTRUCTOR role.'
          : err.message || 'Create failed.'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-wide" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <header className="page-header">
        <Link to="/studio" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', marginBottom: '0.75rem' }}>
          &larr; Back to Studio
        </Link>
        <h1>Create New Course</h1>
        <p className="lede">Fill in the details below to publish a new course.</p>
      </header>

      {error && (
        <div className="alert alert-error" style={{ cursor: 'pointer' }} onClick={() => setError('')}>
          ⚠ {error}
          <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: '0.8rem' }}>Click to dismiss</span>
        </div>
      )}

      <div className="card" style={{ marginTop: '1rem' }}>
        <form className="form-grid" onSubmit={onSubmit}>
          <div>
            <label className="label" htmlFor="cc-name">Course Title *</label>
            <input id="cc-name" name="courseName" className="input" required
              placeholder="e.g., Full-Stack Web Development"
              value={form.courseName} onChange={onChange} />
          </div>

          <div>
            <label className="label" htmlFor="cc-desc">Description *</label>
            <textarea id="cc-desc" name="courseDescription" className="textarea" required
              placeholder="What will students learn in this course?"
              value={form.courseDescription} onChange={onChange}
              style={{ minHeight: '120px' }} />
          </div>

          <div className="form-grid-2">
            <div>
              <label className="label" htmlFor="cc-dur">Duration *</label>
              <input id="cc-dur" name="courseDuration" className="input" required
                placeholder="e.g., 12 hours"
                value={form.courseDuration} onChange={onChange} />
            </div>
            <div>
              <label className="label" htmlFor="cc-price">Price *</label>
              <input id="cc-price" name="coursePrice" className="input" required
                placeholder="e.g., Free or ₹499"
                value={form.coursePrice} onChange={onChange} />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="cc-status">Status</label>
            <select id="cc-status" name="courseStatus" className="select"
              value={form.courseStatus} onChange={onChange}>
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="label">Cover Image</label>
            {form.courseImage && (
              <div style={{
                marginBottom: '0.75rem', borderRadius: '10px', overflow: 'hidden',
                border: '1px solid var(--border)', maxHeight: '200px',
              }}>
                <img src={form.courseImage} alt="Cover preview"
                  style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
              </div>
            )}
            <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', gap: '0.4rem' }}>
              {coverUploading
                ? `Uploading… ${coverProgress}%`
                : form.courseImage ? '🔄 Change Image' : '📷 Upload Cover Image'}
              <input type="file" accept="image/*" style={{ display: 'none' }}
                disabled={coverUploading} onChange={handleCoverUpload} />
            </label>
            {coverUploading && (
              <div style={{ marginTop: '0.4rem', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${coverProgress}%`,
                  background: 'linear-gradient(90deg, var(--indigo), var(--emerald))',
                  borderRadius: '2px', transition: 'width 0.3s ease',
                }} />
              </div>
            )}
            <p className="muted" style={{ fontSize: '0.75rem', marginTop: '0.35rem' }}>
              Recommended: 800×500px or wider. JPG, PNG, or WebP.
            </p>
          </div>

          <div className="actions" style={{ paddingTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={busy || coverUploading}>
              {busy ? '⌛ Creating…' : '🚀 Create Course'}
            </button>
            <Link to="/studio" className="btn btn-ghost">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
