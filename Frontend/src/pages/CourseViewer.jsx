import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getModules, getChapters } from '../api/modules.js'

export default function CourseViewer() {
  const { courseId } = useParams()
  const { credentials, isAuthenticated } = useAuth()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeModule, setActiveModule] = useState(null)
  const [chapters, setChapters] = useState([])
  const [activeChapter, setActiveChapter] = useState(null)
  const [error, setError] = useState('')

  const loadModules = useCallback(async () => {
    if (!credentials) return
    setLoading(true)
    try {
      const res = await getModules(courseId, credentials)
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
    setChapters([])
    try {
      const res = await getChapters(courseId, mod.moduleId, credentials)
      setChapters(Array.isArray(res) ? res : [])
    } catch (e) {
      console.error(e)
    }
  }

  function handleChapterSelect(chap) {
    setActiveChapter(chap)
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="page-wide" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <header className="page-header" style={{ marginBottom: '1rem' }}>
        <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', marginBottom: '1rem' }}>
          &larr; Back to Dashboard
        </Link>
        <h1>Viewing Course {courseId}</h1>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <nav className="card" style={{ flex: '1 1 250px' }}>
          <h2>Syllabus</h2>
          {loading ? <p className="muted">Loading...</p> : (
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

        <main className="card" style={{ flex: '3 1 600px', minHeight: '400px' }}>
          {!activeModule ? (
            <div className="empty-state">
              <p className="muted">Select a module to start learning.</p>
            </div>
          ) : !activeChapter ? (
            <div className="empty-state">
              <h2>{activeModule.moduleName}</h2>
              <p className="muted">Select a chapter from the syllabus on the left.</p>
            </div>
          ) : (
            <article>
              <h2 style={{ borderBottom: '1px solid #3d3b45', paddingBottom: '1rem', marginBottom: '1rem' }}>
                {activeChapter.chapterName}
              </h2>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {activeChapter.chapterDescription || 'No content provided for this chapter.'}
              </div>
            </article>
          )}
        </main>
      </div>
    </div>
  )
}
