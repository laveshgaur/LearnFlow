import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { listCourses, purchaseCourse, getProfile } from '../api/client.js'

function CourseMedia({ src, title }) {
  const [err, setErr] = useState(false)
  if (!src || err) {
    return (
      <div className="course-card-media-fallback" aria-hidden>
        {title?.slice(0, 1)?.toUpperCase() || '?'}
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={title ? `${title} cover` : 'Course cover'}
      loading="lazy"
      onError={() => setErr(true)}
    />
  )
}

const STATUS_META = {
  PUBLISHED: { label: 'Live',     cls: 'tag-success' },
  DRAFT:     { label: 'Draft',    cls: 'tag-outline'  },
  ARCHIVED:  { label: 'Archived', cls: 'tag-violet'   },
}

export default function Courses() {
  const { credentials, isAuthenticated } = useAuth()
  const [courses,  setCourses]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [hint,     setHint]     = useState(null)
  const [busyId,   setBusyId]   = useState(null)
  const [search,   setSearch]   = useState('')

  const [enrolledIds, setEnrolledIds] = useState(new Set())

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError(''); setLoading(true)
      try {
        const [data, profileData] = await Promise.all([
          listCourses(),
          isAuthenticated && credentials ? getProfile(credentials).catch(() => null) : Promise.resolve(null)
        ])
        if (!cancelled) {
          setCourses(Array.isArray(data) ? data : [])
          if (profileData && Array.isArray(profileData.enrolledCourses)) {
            setEnrolledIds(new Set(profileData.enrolledCourses.map(c => c.courseId)))
          }
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load courses.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [isAuthenticated, credentials])

  async function onPurchase(courseId, title) {
    if (!credentials) return
    setHint(null); setBusyId(courseId)
    try {
      await purchaseCourse(credentials, courseId)
      setHint({ type: 'ok', text: `🎉 Enrolled in "${title}"! Find it on your dashboard.` })
      setEnrolledIds(prev => {
        const next = new Set(prev)
        next.add(courseId)
        return next
      })
    } catch (e) {
      setHint({
        type: 'err',
        text: e.status === 401 ? 'Session expired — log in again.'
            : e.status === 403 ? 'Not allowed to enroll.'
            : e.message || 'Enrollment failed.',
      })
    } finally {
      setBusyId(null)
    }
  }

  const filtered = (courses || []).filter(c =>
    !search || c.courseName?.toLowerCase().includes(search.toLowerCase())
  )
  const published = courses ? courses.filter(c => c.courseStatus === 'PUBLISHED').length : 0

  return (
    <div className="page-wide page-bleed" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
      <header className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Course Catalog</h1>
            <p className="lede">
              {loading ? 'Loading courses…' : `${published} published course${published !== 1 ? 's' : ''} available`}
              {!isAuthenticated && ' · Log in to enroll'}
            </p>
          </div>
          {!isAuthenticated && (
            <Link to="/login" className="btn btn-primary">Log in to enroll</Link>
          )}
        </div>

        {/* Search bar */}
        {!loading && courses && courses.length > 3 && (
          <div style={{ marginTop: '1rem', maxWidth: '360px' }}>
            <input
              className="input"
              type="search"
              placeholder="Search courses…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}
      </header>

      {hint?.type === 'ok'  && <div className="alert alert-success">{hint.text}</div>}
      {hint?.type === 'err' && <div className="alert alert-error">{hint.text}</div>}
      {error                && <div className="alert alert-error">⚠ {error}</div>}

      {/* Skeleton */}
      {loading && (
        <div className="course-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="course-card">
              <div className="course-card-media skeleton" style={{ borderRadius: 0 }} />
              <div className="course-card-body" style={{ gap: '0.75rem' }}>
                <div className="skeleton" style={{ height: 20, width: '75%' }} />
                <div className="skeleton" style={{ height: 14, width: '100%' }} />
                <div className="skeleton" style={{ height: 14, width: '55%' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="card empty-state">
          <div className="empty-icon">◈</div>
          <p>
            {search ? `No courses match "${search}".` : 'No courses published yet — instructors publish from the Studio.'}
          </p>
          {search
            ? <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>Clear search</button>
            : <Link to="/studio" className="btn btn-secondary">Open Studio</Link>
          }
        </div>
      )}

      {/* Course grid */}
      {!loading && filtered.length > 0 && (
        <div className="course-grid">
          {filtered.map(c => {
            const status = STATUS_META[c.courseStatus] || { label: c.courseStatus, cls: 'tag-outline' }
            const isPublished = c.courseStatus === 'PUBLISHED'
            const isEnrolled = enrolledIds.has(c.courseId)
            return (
              <article key={c.courseId} className="course-card">
                <div className="course-card-media">
                  <CourseMedia src={c.courseImage} title={c.courseName} />
                  {isPublished && <span className="course-card-ribbon">Live</span>}
                </div>
                <div className="course-card-body">
                  <h3>{c.courseName}</h3>
                  <p className="course-card-desc">
                    {(c.courseDescription?.length ?? 0) > 130
                      ? `${c.courseDescription.slice(0, 130)}…`
                      : c.courseDescription}
                  </p>
                  <div className="course-card-meta">
                    {c.courseDuration && <span className="tag tag-outline">⏱ {c.courseDuration}</span>}
                    {c.coursePrice    && <span className="tag tag-accent">  {c.coursePrice}</span>}
                    <span className={`tag ${status.cls}`}>{status.label}</span>
                  </div>
                  <div className="course-card-actions">
                    {isAuthenticated && isPublished && isEnrolled && (
                      <Link to={`/course/${c.courseId}`} className="btn btn-secondary btn-block" style={{ color: 'var(--emerald)', borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.05)' }}>
                        ✓ Enrolled — Study now
                      </Link>
                    )}
                    {isAuthenticated && isPublished && !isEnrolled && (
                      <button
                        type="button"
                        className="btn btn-primary btn-block"
                        disabled={busyId === c.courseId}
                        onClick={() => onPurchase(c.courseId, c.courseName)}
                      >
                        {busyId === c.courseId ? '⌛ Enrolling…' : 'Enroll now →'}
                      </button>
                    )}
                    {isAuthenticated && !isPublished && (
                      <span className="enroll-hint">Not yet published</span>
                    )}
                    {!isAuthenticated && isPublished && (
                      <Link to="/login" className="btn btn-secondary btn-block">
                        Log in to enroll
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
