import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getCourseAnalytics } from '../api/progress.js'

export default function Analytics() {
  const { courseId } = useParams()
  const { credentials, isAuthenticated, isInstructor } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !credentials) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await getCourseAnalytics(courseId, credentials.token)
        if (!cancelled) setData(res)
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load analytics')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [courseId, credentials, isAuthenticated])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="page-wide analytics-page">
      <header className="page-header">
        <Link to={`/studio/course/${courseId}`} className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }}>
          &larr; Back to Course Builder
        </Link>
        <h1>Course Analytics</h1>
        <p className="lede">
          Performance metrics for {data?.courseName || `Course #${courseId}`}
        </p>
      </header>

      {error && <div className="alert alert-error">⚠ {error}</div>}

      {loading ? (
        <div className="stats-row">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: 110, borderRadius: 'var(--radius-sm)' }} />
          ))}
        </div>
      ) : data ? (
        <>
          {/* ── Metric Tiles ── */}
          <div className="analytics-grid">
            <div className="analytics-tile">
              <div className="analytics-tile-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>
                👥
              </div>
              <div className="analytics-tile-body">
                <p className="analytics-value">{data.enrolledCount}</p>
                <p className="analytics-label">Enrolled Students</p>
              </div>
            </div>

            <div className="analytics-tile">
              <div className="analytics-tile-icon" style={{ background: 'rgba(167,139,250,0.15)' }}>
                📦
              </div>
              <div className="analytics-tile-body">
                <p className="analytics-value">{data.moduleCount}</p>
                <p className="analytics-label">Modules</p>
              </div>
            </div>

            <div className="analytics-tile">
              <div className="analytics-tile-icon" style={{ background: 'rgba(34,211,238,0.15)' }}>
                📖
              </div>
              <div className="analytics-tile-body">
                <p className="analytics-value">{data.chapterCount}</p>
                <p className="analytics-label">Chapters</p>
              </div>
            </div>

            <div className="analytics-tile">
              <div className="analytics-tile-icon" style={{ background: 'rgba(251,191,36,0.15)' }}>
                🎬
              </div>
              <div className="analytics-tile-body">
                <p className="analytics-value">{data.videoCount}</p>
                <p className="analytics-label">Videos</p>
              </div>
            </div>
          </div>

          {/* ── Completion Rate ── */}
          <div className="card analytics-completion-card">
            <h2 style={{ marginBottom: '1.5rem' }}>📊 Completion Overview</h2>

            <div className="analytics-completion-row">
              <div className="analytics-rate-circle">
                <svg viewBox="0 0 120 120" className="analytics-ring">
                  <defs>
                    <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                  <circle cx="60" cy="60" r="52" className="analytics-ring-bg" />
                  <circle
                    cx="60" cy="60" r="52"
                    className="analytics-ring-fill"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 52}`,
                      strokeDashoffset: `${2 * Math.PI * 52 * (1 - (data.completionRate || 0) / 100)}`,
                    }}
                  />
                </svg>
                <div className="analytics-rate-text">
                  <span className="analytics-rate-num">{data.completionRate}%</span>
                  <span className="analytics-rate-label">Completion</span>
                </div>
              </div>

              <div className="analytics-completion-details">
                <div className="analytics-detail-row">
                  <span className="muted">Completed Chapters</span>
                  <strong style={{ color: 'var(--emerald)' }}>{data.completedChapters}</strong>
                </div>
                <div className="analytics-detail-row">
                  <span className="muted">Total Possible Completions</span>
                  <strong>{data.totalPossibleCompletions}</strong>
                </div>
                <div className="analytics-detail-row">
                  <span className="muted">Avg. Chapters per Student</span>
                  <strong>
                    {data.enrolledCount > 0
                      ? (data.completedChapters / data.enrolledCount).toFixed(1)
                      : '0'}
                  </strong>
                </div>

                {/* Progress Bar */}
                <div style={{ marginTop: '1rem' }}>
                  <div className="analytics-progress-bar">
                    <div
                      className="analytics-progress-fill"
                      style={{ width: `${Math.min(data.completionRate, 100)}%` }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                    <span className="muted" style={{ fontSize: '0.75rem' }}>0%</span>
                    <span className="muted" style={{ fontSize: '0.75rem' }}>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Content Breakdown ── */}
          <div className="card analytics-breakdown-card">
            <h2 style={{ marginBottom: '1.25rem' }}>📋 Content Breakdown</h2>
            <div className="analytics-bar-chart">
              {[
                { label: 'Modules', value: data.moduleCount, color: 'var(--violet)', max: Math.max(data.moduleCount, data.chapterCount, data.videoCount, 1) },
                { label: 'Chapters', value: data.chapterCount, color: 'var(--cyan)', max: Math.max(data.moduleCount, data.chapterCount, data.videoCount, 1) },
                { label: 'Videos', value: data.videoCount, color: 'var(--amber)', max: Math.max(data.moduleCount, data.chapterCount, data.videoCount, 1) },
              ].map(item => (
                <div key={item.label} className="analytics-bar-row">
                  <span className="analytics-bar-label">{item.label}</span>
                  <div className="analytics-bar-track">
                    <div
                      className="analytics-bar-fill"
                      style={{
                        width: `${(item.value / item.max) * 100}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                  <span className="analytics-bar-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
