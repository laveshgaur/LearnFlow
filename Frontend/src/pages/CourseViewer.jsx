import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import VideoPlayer from '../components/VideoPlayer.jsx'
import { getModules, getChapters, getVideos } from '../api/modules.js'

const MAX_TITLE_LEN = 60

function VideoTitle({ title }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = title.length > MAX_TITLE_LEN
  const display = isLong && !expanded ? title.slice(0, MAX_TITLE_LEN).trimEnd() + '…' : title
  return (
    <p style={{
      margin: '0.5rem 0 0',
      fontSize: '0.875rem',
      fontWeight: 600,
      color: 'var(--text-muted)',
      wordBreak: 'break-word',
      overflowWrap: 'anywhere',
      lineHeight: 1.4,
    }}>
      {display}
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          style={{
            marginLeft: '0.35rem',
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'var(--indigo-light)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </p>
  )
}

export default function CourseViewer() {
  const { courseId } = useParams()
  const { credentials, isAuthenticated } = useAuth()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeModule, setActiveModule] = useState(null)
  const [chapters, setChapters] = useState([])
  const [activeChapter, setActiveChapter] = useState(null)
  const [videos, setVideos] = useState([])
  const [error, setError] = useState('')

  // Mobile view: 'syllabus' | 'content'
  const [mobileView, setMobileView] = useState('syllabus')

  const loadModules = useCallback(async () => {
    if (!credentials) return
    setLoading(true)
    try {
      const res = await getModules(courseId, credentials.token)
      setModules(Array.isArray(res) ? res : [])
    } catch (e) {
      if (e.status !== 204) setError('Could not load course modules. Did you purchase this course?')
    } finally {
      setLoading(false)
    }
  }, [courseId, credentials])

  useEffect(() => {
    if (isAuthenticated && credentials) loadModules()
  }, [isAuthenticated, credentials, loadModules])

  async function loadChaptersForModule(mod) {
    setActiveModule(mod)
    setActiveChapter(null)
    setVideos([])
    setChapters([])
    try {
      const res = await getChapters(courseId, mod.moduleId, credentials.token)
      setChapters(Array.isArray(res) ? res : [])
    } catch (e) {
      console.error(e)
    }
  }

  function handleChapterSelect(chap) {
    setActiveChapter(chap)
    setVideos([])
    // Switch to content view on mobile
    setMobileView('content')
    getVideos(courseId, activeModule.moduleId, chap.chapterId, credentials.token)
      .then(res => setVideos(Array.isArray(res) ? res : []))
      .catch(console.error)
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const syllabus = (
    <nav className="card cv-nav">
      <h2>Syllabus</h2>
      {loading ? (
        <p className="muted">Loading...</p>
      ) : (
        <ul className="stack">
          {modules.map(mod => (
            <li key={mod.moduleId}>
              <button
                className={`btn btn-block ${activeModule?.moduleId === mod.moduleId ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => loadChaptersForModule(mod)}
              >
                {mod.moduleName}
              </button>
              {activeModule?.moduleId === mod.moduleId && chapters.length > 0 && (
                <ul style={{ paddingLeft: '1rem', marginTop: '0.5rem', listStyle: 'none' }}>
                  {chapters.map(chap => (
                    <li key={chap.chapterId} style={{ marginTop: '0.5rem' }}>
                      <button
                        className={`btn btn-block btn-sm ${activeChapter?.chapterId === chap.chapterId ? 'btn-secondary' : 'btn-ghost'}`}
                        onClick={() => handleChapterSelect(chap)}
                      >
                        {chap.chapterName}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </nav>
  )

  const content = (
    <main className="card cv-main" style={{ minHeight: '400px' }}>
      {!activeModule ? (
        <div className="empty-state">
          <div className="empty-icon">🎓</div>
          <p className="muted">Select a module to start learning.</p>
        </div>
      ) : !activeChapter ? (
        <div className="empty-state">
          <div className="empty-icon">📖</div>
          <h2>{activeModule.moduleName}</h2>
          <p className="muted">Select a chapter from the syllabus.</p>
        </div>
      ) : (
        <article>
          <h2 style={{ borderBottom: '1px solid #3d3b45', paddingBottom: '1rem', marginBottom: '1rem' }}>
            {activeChapter.chapterName}
          </h2>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {activeChapter.chapterDescription || 'No content provided for this chapter.'}
          </div>
          {videos.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3>Videos</h3>
              {videos.map(vid => (
                <div key={vid.id || vid.videoId} style={{ marginTop: '1.25rem' }}>
                  <VideoPlayer src={vid.videoUrl} />
                  <VideoTitle title={vid.videoTitle} />
                </div>
              ))}
            </div>
          )}
        </article>
      )}
    </main>
  )

  return (
    <div className="page-wide cv-shell">
      <header className="page-header" style={{ marginBottom: '0.5rem' }}>
        <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', marginBottom: '0.75rem' }}>
          &larr; Back to Dashboard
        </Link>
        <h1>Viewing Course {courseId}</h1>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── Mobile tab bar ── */}
      <div className="cv-tabs">
        <button
          type="button"
          className={`cv-tab ${mobileView === 'syllabus' ? 'cv-tab-active' : ''}`}
          onClick={() => setMobileView('syllabus')}
        >
          📚 Syllabus
        </button>
        <button
          type="button"
          className={`cv-tab ${mobileView === 'content' ? 'cv-tab-active' : ''}`}
          onClick={() => setMobileView('content')}
        >
          📖 {activeChapter ? activeChapter.chapterName : 'Content'}
        </button>
      </div>

      {/* ── Mobile: show one panel at a time ── */}
      <div className="cv-mobile-view">
        {mobileView === 'syllabus' ? syllabus : content}
      </div>

      {/* ── Desktop: two-column grid (both panels always visible) ── */}
      <div className="cv-body">
        {syllabus}
        {content}
      </div>
    </div>
  )
}
