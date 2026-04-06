import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { listCourses, purchaseCourse } from '../api/client.js'

function CourseMedia({ src, title }) {
  const [err, setErr] = useState(false)
  if (!src || err) {
    return (
      <div className="course-card-media-fallback" aria-hidden>
        {title?.slice(0, 1)?.toUpperCase() || '?'}
      </div>
    )
  }
  return <img src={src} alt={title ? `${title} cover` : 'Course cover'} loading="lazy" onError={() => setErr(true)} />
}

function isPublished(c) {
  return String(c.courseStatus || '').toUpperCase() === 'PUBLISHED'
}

export default function Courses() {
  const { credentials, isAuthenticated } = useAuth()
  const [courses, setCourses] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [purchaseHint, setPurchaseHint] = useState(null)
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError('')
      setLoading(true)
      try {
        const data = await listCourses()
        if (!cancelled) {
          if (Array.isArray(data)) setCourses(data)
          else setCourses([])
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load courses.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function onPurchase(courseId, title) {
    if (!credentials) return
    setPurchaseHint(null)
    setBusyId(courseId)
    try {
      await purchaseCourse(credentials, courseId)
      setPurchaseHint({ type: 'ok', text: `You’re in: ${title}` })
    } catch (e) {
      const msg =
        e.status === 401
          ? 'Session expired — log in again.'
          : e.status === 403
            ? 'Not allowed to purchase this course.'
            : e.message || 'Purchase failed.'
      setPurchaseHint({ type: 'err', text: msg })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="page-wide page-bleed catalog-page" style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem' }}>
      <header className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Catalog</h1>
            <p className="lede">
              Public <code>GET /courses</code>. Logged-in learners can call{' '}
              <code>POST /user/purchase-course/&#123;id&#125;</code> on published courses.
            </p>
          </div>
          {!isAuthenticated ? (
            <Link to="/login" className="btn btn-primary">
              Log in to enroll
            </Link>
          ) : null}
        </div>
      </header>

      {purchaseHint?.type === 'ok' ? <div className="alert alert-success">{purchaseHint.text}</div> : null}
      {purchaseHint?.type === 'err' ? <div className="alert alert-error">{purchaseHint.text}</div> : null}

      {loading ? (
        <div className="course-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="course-card">
              <div className="course-card-media skeleton" style={{ borderRadius: 0 }} />
              <div className="course-card-body">
                <div className="skeleton" style={{ height: 22, width: '80%' }} />
                <div className="skeleton" style={{ height: 14, width: '100%' }} />
                <div className="skeleton" style={{ height: 14, width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {error ? <div className="alert alert-error">{error}</div> : null}

      {!loading && !error && courses && courses.length === 0 ? (
        <div className="card empty-state catalog-empty">
          <p>No courses in the API yet. Instructors publish from the studio.</p>
          <Link to="/studio" className="btn btn-secondary">
            Instructor studio
          </Link>
        </div>
      ) : null}

      {!loading && courses && courses.length > 0 ? (
        <div className="course-grid">
          {courses.map((c) => (
            <article key={c.courseId} className="course-card">
              <div className="course-card-media">
                <CourseMedia src={c.courseImage} title={c.courseName} />
                {isPublished(c) ? <span className="course-card-ribbon">Live</span> : null}
              </div>
              <div className="course-card-body">
                <h3>{c.courseName}</h3>
                <p className="muted course-card-desc">
                  {c.courseDescription?.length > 140
                    ? `${c.courseDescription.slice(0, 140)}…`
                    : c.courseDescription}
                </p>
                <div className="course-card-meta">
                  <span className="tag tag-outline">{c.courseDuration}</span>
                  <span className="tag tag-accent">{c.coursePrice}</span>
                  <span className="tag">{c.courseStatus}</span>
                </div>
                <div className="course-card-actions">
                  {isAuthenticated && isPublished(c) ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-block"
                      disabled={busyId === c.courseId}
                      onClick={() => onPurchase(c.courseId, c.courseName)}
                    >
                      {busyId === c.courseId ? 'Enrolling…' : 'Enroll / purchase'}
                    </button>
                  ) : null}
                  {isAuthenticated && !isPublished(c) ? (
                    <span className="muted enroll-hint">Not published — enrollment disabled</span>
                  ) : null}
                  {!isAuthenticated && isPublished(c) ? (
                    <Link to="/login" className="btn btn-secondary btn-block">
                      Log in to enroll
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  )
}
