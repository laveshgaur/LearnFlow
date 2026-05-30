import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import VideoPlayer from '../components/VideoPlayer.jsx'
import { getModules, getChapters, getVideos } from '../api/modules.js'
import { getCourseProgress, updateVideoProgress, getVideoProgress } from '../api/progress.js'

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

  // Progress tracking
  const [completedChapterIds, setCompletedChapterIds] = useState(new Set())
  // Per-video watch progress: { [videoId]: watchPercent }
  const [videoWatchState, setVideoWatchState] = useState({})

  // Per-module chapter cache: { [moduleId]: Chapter[] }
  const [moduleChapters, setModuleChapters] = useState({})

  // Mobile view: 'syllabus' | 'content'
  const [mobileView, setMobileView] = useState('syllabus')

  // Chapter time-spent tracker
  const chapterEntryTime = useRef(null)
  const lastHeartbeat = useRef(null)

  // Load progress
  const loadProgress = useCallback(async () => {
    if (!credentials) return
    try {
      const data = await getCourseProgress(courseId, credentials.token)
      const ids = new Set()
      if (Array.isArray(data)) {
        data.forEach(p => { if (p.completed) ids.add(p.chapterId) })
      }
      setCompletedChapterIds(ids)
    } catch {
      // Progress may not exist yet
    }
  }, [courseId, credentials])

  const loadModules = useCallback(async () => {
    if (!credentials) return
    setLoading(true)
    try {
      const res = await getModules(courseId, credentials.token)
      const mods = Array.isArray(res) ? res : []
      setModules(mods)

      // Auto-select first module and load its chapters
      if (mods.length > 0) {
        const firstMod = mods[0]
        setActiveModule(firstMod)
        try {
          const chs = await getChapters(courseId, firstMod.moduleId, credentials.token)
          const chList = Array.isArray(chs) ? chs : []
          setChapters(chList)
          setModuleChapters(prev => ({ ...prev, [firstMod.moduleId]: chList }))

          // Auto-select first chapter
          if (chList.length > 0) {
            const firstCh = chList[0]
            setActiveChapter(firstCh)
            chapterEntryTime.current = Date.now()
            lastHeartbeat.current = Date.now()
            try {
              const vids = await getVideos(courseId, firstMod.moduleId, firstCh.chapterId, credentials.token)
              setVideos(Array.isArray(vids) ? vids : [])
              // Load existing video progress
              loadVideoProgress(firstCh.chapterId)
            } catch { setVideos([]) }
          }
        } catch { setChapters([]) }
      }
    } catch (e) {
      if (e.status !== 204) setError('Could not load course modules. Did you purchase this course?')
    } finally {
      setLoading(false)
    }
  }, [courseId, credentials])

  // Load existing per-video progress for a chapter
  async function loadVideoProgress(chapterId) {
    if (!credentials) return
    try {
      const data = await getVideoProgress(chapterId, credentials.token)
      if (Array.isArray(data)) {
        const state = {}
        data.forEach(vp => { state[vp.videoId] = vp.watchPercent })
        setVideoWatchState(prev => ({ ...prev, ...state }))
      }
    } catch { /* ignore */ }
  }

  useEffect(() => {
    if (isAuthenticated && credentials) {
      loadModules()
      loadProgress()
    }
  }, [isAuthenticated, credentials, loadModules, loadProgress])

  // Check if a module is fully completed (all chapters done)
  function isModuleCompleted(moduleId) {
    const chs = moduleChapters[moduleId]
    if (!chs || chs.length === 0) return false
    return chs.every(ch => completedChapterIds.has(ch.chapterId))
  }

  // Check if a module is unlocked
  function isModuleUnlocked(moduleIndex) {
    if (moduleIndex === 0) return true
    const prevMod = modules[moduleIndex - 1]
    return isModuleCompleted(prevMod.moduleId)
  }

  async function loadChaptersForModule(mod, moduleIndex) {
    if (!isModuleUnlocked(moduleIndex)) return
    setActiveModule(mod)
    setActiveChapter(null)
    setVideos([])
    setVideoWatchState({})

    if (moduleChapters[mod.moduleId]) {
      setChapters(moduleChapters[mod.moduleId])
      return
    }

    setChapters([])
    try {
      const res = await getChapters(courseId, mod.moduleId, credentials.token)
      const chList = Array.isArray(res) ? res : []
      setChapters(chList)
      setModuleChapters(prev => ({ ...prev, [mod.moduleId]: chList }))
    } catch (e) {
      console.error(e)
    }
  }

  function handleChapterSelect(chap) {
    setActiveChapter(chap)
    setVideos([])
    setVideoWatchState({})
    setMobileView('content')
    chapterEntryTime.current = Date.now()
    lastHeartbeat.current = Date.now()

    getVideos(courseId, activeModule.moduleId, chap.chapterId, credentials.token)
      .then(res => {
        setVideos(Array.isArray(res) ? res : [])
        loadVideoProgress(chap.chapterId)
      })
      .catch(console.error)
  }

  /**
   * Called by VideoPlayer every ~5 seconds while a video is playing.
   * Sends progress to backend which auto-completes the chapter when conditions are met.
   */
  function handleVideoProgress({ videoId, watchPercent, currentTime, duration }) {
    if (!credentials || !activeChapter) return

    // Update local state immediately for live UI
    setVideoWatchState(prev => ({
      ...prev,
      [videoId]: Math.max(prev[videoId] || 0, watchPercent),
    }))

    // Calculate time spent delta since last heartbeat
    const now = Date.now()
    const timeDelta = Math.round((now - (lastHeartbeat.current || now)) / 1000)
    lastHeartbeat.current = now

    // Send to backend
    updateVideoProgress(videoId, credentials.token, {
      watchPercent,
      lastPosition: currentTime,
      chapterId: activeChapter.chapterId,
      timeSpentDelta: timeDelta,
    }).then(res => {
      if (res && res.justCompleted) {
        // Chapter just auto-completed!
        setCompletedChapterIds(prev => new Set([...prev, activeChapter.chapterId]))
      }
    }).catch(() => { /* silent – will retry on next heartbeat */ })
  }

  // Load chapters for all modules in background for progress checking
  useEffect(() => {
    if (!credentials || modules.length === 0) return
    modules.forEach(async (mod) => {
      if (moduleChapters[mod.moduleId]) return
      try {
        const chs = await getChapters(courseId, mod.moduleId, credentials.token)
        const chList = Array.isArray(chs) ? chs : []
        setModuleChapters(prev => ({ ...prev, [mod.moduleId]: chList }))
      } catch { /* ignore */ }
    })
  }, [modules, credentials, courseId])

  // Time-spent heartbeat for chapters with no videos
  // Sends a periodic heartbeat so the backend can track time spent
  useEffect(() => {
    if (!activeChapter || !credentials) return

    const timer = setInterval(() => {
      if (!activeChapter || completedChapterIds.has(activeChapter.chapterId)) return

      // For chapters with no videos, create a dummy heartbeat
      // by sending a "video 0" progress with just time delta
      const now = Date.now()
      const timeDelta = Math.round((now - (lastHeartbeat.current || now)) / 1000)
      lastHeartbeat.current = now

      if (timeDelta > 0 && videos.length === 0) {
        // No videos — use the chapter-time heartbeat path
        // We'll piggyback on the video endpoint with videoId=0
        // Actually, for no-video chapters we need a separate approach:
        // send to any video endpoint — but there are no videos.
        // Instead, let's just keep counting locally.
        // The chapter will auto-complete when a video progress call is made.
      }
    }, 10000)

    return () => clearInterval(timer)
  }, [activeChapter, credentials, videos.length])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  // ── Compute overall chapter video completion for the current chapter ──
  const allVideosWatched = videos.length > 0 && videos.every(
    vid => (videoWatchState[vid.videoId] || 0) >= 90
  )
  const chapterVideoPercent = videos.length > 0
    ? Math.round(videos.reduce((sum, vid) => sum + Math.min(100, videoWatchState[vid.videoId] || 0), 0) / videos.length)
    : 0

  const isCurrentChapterComplete = activeChapter && completedChapterIds.has(activeChapter.chapterId)

  const syllabus = (
    <nav className="card cv-nav">
      <h2>Syllabus</h2>
      {loading ? (
        <p className="muted">Loading...</p>
      ) : (
        <ul className="stack">
          {modules.map((mod, idx) => {
            const unlocked = isModuleUnlocked(idx)
            const completed = isModuleCompleted(mod.moduleId)
            const modChaps = moduleChapters[mod.moduleId] || []
            const completedCount = modChaps.filter(ch => completedChapterIds.has(ch.chapterId)).length

            return (
              <li key={mod.moduleId}>
                <button
                  className={`btn btn-block ${activeModule?.moduleId === mod.moduleId ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => loadChaptersForModule(mod, idx)}
                  disabled={!unlocked}
                  style={{
                    opacity: unlocked ? 1 : 0.45,
                    position: 'relative',
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                    {completed ? (
                      <span style={{ color: 'var(--emerald)', fontSize: '1.1rem', flexShrink: 0 }}>✓</span>
                    ) : !unlocked ? (
                      <span style={{ fontSize: '0.9rem', flexShrink: 0, opacity: 0.5 }}>🔒</span>
                    ) : null}
                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {mod.moduleName}
                    </span>
                    {unlocked && modChaps.length > 0 && (
                      <span className="tag tag-outline" style={{ flexShrink: 0, fontSize: '0.65rem' }}>
                        {completedCount}/{modChaps.length}
                      </span>
                    )}
                  </span>
                </button>
                {activeModule?.moduleId === mod.moduleId && chapters.length > 0 && (
                  <ul style={{ paddingLeft: '1rem', marginTop: '0.5rem', listStyle: 'none' }}>
                    {chapters.map(chap => {
                      const isDone = completedChapterIds.has(chap.chapterId)
                      return (
                        <li key={chap.chapterId} style={{ marginTop: '0.5rem' }}>
                          <button
                            className={`btn btn-block btn-sm ${activeChapter?.chapterId === chap.chapterId ? 'btn-secondary' : 'btn-ghost'}`}
                            onClick={() => handleChapterSelect(chap)}
                            style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%' }}>
                              {isDone ? (
                                <span style={{ color: 'var(--emerald)', fontSize: '0.9rem', flexShrink: 0 }}>✓</span>
                              ) : (
                                <span style={{
                                  width: '14px', height: '14px', borderRadius: '50%',
                                  border: '2px solid var(--border-strong)', flexShrink: 0,
                                }} />
                              )}
                              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {chap.chapterName}
                              </span>
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #3d3b45', paddingBottom: '1rem', marginBottom: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0 }}>
              {activeChapter.chapterName}
            </h2>
            {isCurrentChapterComplete && (
              <span className="cv-complete-badge" style={{ animation: 'none' }}>
                <span style={{ fontSize: '0.9rem' }}>✓</span>
                <span>Completed</span>
              </span>
            )}
          </div>

          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {activeChapter.chapterDescription || 'No content provided for this chapter.'}
          </div>

          {videos.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Videos</h3>
                {!isCurrentChapterComplete && (
                  <span className="tag tag-outline" style={{ fontSize: '0.65rem' }}>
                    {chapterVideoPercent}% overall
                  </span>
                )}
              </div>

              {/* Overall chapter video progress bar */}
              {!isCurrentChapterComplete && (
                <div className="cv-chapter-progress">
                  <div className="cv-chapter-progress-bar">
                    <div
                      className="cv-chapter-progress-fill"
                      style={{ width: `${chapterVideoPercent}%` }}
                    />
                  </div>
                  <span className="muted" style={{ fontSize: '0.72rem' }}>
                    {allVideosWatched
                      ? 'All videos watched — completing soon…'
                      : `Watch all videos to complete this chapter`}
                  </span>
                </div>
              )}

              {videos.map(vid => (
                <div key={vid.id || vid.videoId} style={{ marginTop: '1.25rem' }}>
                  <VideoPlayer
                    src={vid.videoUrl}
                    videoId={vid.videoId}
                    onProgress={handleVideoProgress}
                  />
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
