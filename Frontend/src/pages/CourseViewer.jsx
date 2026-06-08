import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import VideoPlayer from '../components/VideoPlayer.jsx'
import { getModules, getChapters, getVideos } from '../api/modules.js'
import { getCourseProgress, updateVideoProgress, getVideoProgress } from '../api/progress.js'
import { getStudentQuiz, submitQuiz, getQuizStatus } from '../api/quiz.js'

const MAX_TITLE_LEN = 60

function VideoTitle({ title }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = title.length > MAX_TITLE_LEN
  const display = isLong && !expanded ? title.slice(0, MAX_TITLE_LEN).trimEnd() + '…' : title
  return (
    <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: 1.4 }}>
      {display}
      {isLong && (
        <button type="button" onClick={() => setExpanded(e => !e)} style={{ marginLeft: '0.35rem', background: 'none', border: 'none', padding: 0, color: 'var(--indigo-light)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
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

  // Progress
  const [completedChapterIds, setCompletedChapterIds] = useState(new Set())
  const [videoWatchState, setVideoWatchState] = useState({})
  const [moduleChapters, setModuleChapters] = useState({})
  const [mobileView, setMobileView] = useState('syllabus')

  // Quiz status per module: { [moduleId]: { hasQuiz, passed, quizId, bestScore } }
  const [quizStatuses, setQuizStatuses] = useState({})

  // Active quiz state
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizData, setQuizData] = useState(null)
  const [quizAnswers, setQuizAnswers] = useState([])
  const [quizSubmitting, setQuizSubmitting] = useState(false)
  const [quizResult, setQuizResult] = useState(null)

  const chapterEntryTime = useRef(null)
  const lastHeartbeat = useRef(null)

  // Load progress (new response shape: { chapters, quizStatuses })
  const loadProgress = useCallback(async () => {
    if (!credentials) return
    try {
      const data = await getCourseProgress(courseId, credentials.token)
      const ids = new Set()
      const chapters = data?.chapters || data // backward compat
      if (Array.isArray(chapters)) {
        chapters.forEach(p => { if (p.completed) ids.add(p.chapterId) })
      }
      setCompletedChapterIds(ids)

      // Quiz statuses
      if (Array.isArray(data?.quizStatuses)) {
        const qs = {}
        data.quizStatuses.forEach(q => {
          qs[q.moduleId] = { hasQuiz: true, passed: q.passed, quizId: q.quizId }
        })
        setQuizStatuses(qs)
      }
    } catch { /* ignore */ }
  }, [courseId, credentials])

  const loadModules = useCallback(async () => {
    if (!credentials) return
    setLoading(true)
    try {
      const res = await getModules(courseId, credentials.token)
      const mods = Array.isArray(res) ? res : []
      setModules(mods)
      if (mods.length > 0) {
        const firstMod = mods[0]
        setActiveModule(firstMod)
        try {
          const chs = await getChapters(courseId, firstMod.moduleId, credentials.token)
          const chList = Array.isArray(chs) ? chs : []
          setChapters(chList)
          setModuleChapters(prev => ({ ...prev, [firstMod.moduleId]: chList }))
          if (chList.length > 0) {
            const firstCh = chList[0]
            setActiveChapter(firstCh)
            chapterEntryTime.current = Date.now()
            lastHeartbeat.current = Date.now()
            try {
              const vids = await getVideos(courseId, firstMod.moduleId, firstCh.chapterId, credentials.token)
              setVideos(Array.isArray(vids) ? vids : [])
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

  // ── Module completion: all chapters done + quiz passed ──
  function isModuleCompleted(moduleId) {
    const chs = moduleChapters[moduleId]
    if (!chs || chs.length === 0) return false
    const allChapsDone = chs.every(ch => completedChapterIds.has(ch.chapterId))
    if (!allChapsDone) return false
    // Quiz check
    const qs = quizStatuses[moduleId]
    if (qs && qs.hasQuiz && !qs.passed) return false
    return true
  }

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
    setShowQuiz(false)
    setQuizData(null)
    setQuizResult(null)

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
    } catch (e) { console.error(e) }
  }

  function handleChapterSelect(chap) {
    setActiveChapter(chap)
    setVideos([])
    setVideoWatchState({})
    setMobileView('content')
    setShowQuiz(false)
    setQuizData(null)
    setQuizResult(null)
    chapterEntryTime.current = Date.now()
    lastHeartbeat.current = Date.now()
    getVideos(courseId, activeModule.moduleId, chap.chapterId, credentials.token)
      .then(res => { setVideos(Array.isArray(res) ? res : []); loadVideoProgress(chap.chapterId) })
      .catch(console.error)
  }

  function handleVideoProgress({ videoId, watchPercent, currentTime, duration }) {
    if (!credentials || !activeChapter) return
    setVideoWatchState(prev => ({ ...prev, [videoId]: Math.max(prev[videoId] || 0, watchPercent) }))
    const now = Date.now()
    const timeDelta = Math.round((now - (lastHeartbeat.current || now)) / 1000)
    lastHeartbeat.current = now
    updateVideoProgress(videoId, credentials.token, {
      watchPercent, lastPosition: currentTime, chapterId: activeChapter.chapterId, timeSpentDelta: timeDelta,
    }).then(res => {
      if (res && res.justCompleted) {
        setCompletedChapterIds(prev => new Set([...prev, activeChapter.chapterId]))
      }
    }).catch(() => {})
  }

  // Background load chapters for all modules
  useEffect(() => {
    if (!credentials || modules.length === 0) return
    modules.forEach(async (mod) => {
      if (moduleChapters[mod.moduleId]) return
      try {
        const chs = await getChapters(courseId, mod.moduleId, credentials.token)
        setModuleChapters(prev => ({ ...prev, [mod.moduleId]: Array.isArray(chs) ? chs : [] }))
      } catch { /* ignore */ }
    })
  }, [modules, credentials, courseId])

  // ── Quiz handlers ──
  async function handleOpenQuiz() {
    if (!activeModule || !credentials) return
    setQuizResult(null)
    try {
      const data = await getStudentQuiz(activeModule.moduleId, credentials.token)
      if (!data.hasQuiz) { setError('No quiz available for this module'); return }
      setQuizData(data)
      setQuizAnswers(new Array(data.questions?.length || 0).fill(-1))
      setShowQuiz(true)
      setActiveChapter(null)
      setMobileView('content')
    } catch (e) { setError(e.message || 'Failed to load quiz') }
  }

  async function handleSubmitQuiz() {
    if (!quizData || quizSubmitting) return
    setQuizSubmitting(true)
    try {
      const result = await submitQuiz(quizData.quizId, credentials.token, quizAnswers)
      setQuizResult(result)
      if (result.passed) {
        // Update quiz status locally
        setQuizStatuses(prev => ({
          ...prev,
          [activeModule.moduleId]: { hasQuiz: true, passed: true, quizId: quizData.quizId }
        }))
      }
    } catch (e) { setError(e.message || 'Failed to submit quiz') }
    finally { setQuizSubmitting(false) }
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  // ── Course completion % ──
  const allChapterIds = Object.values(moduleChapters).flat().map(ch => ch.chapterId)
  const courseCompletionPercent = allChapterIds.length > 0
    ? Math.round(allChapterIds.filter(id => completedChapterIds.has(id)).length / allChapterIds.length * 100)
    : 0

  // Current chapter video stats
  const chapterVideoPercent = videos.length > 0
    ? Math.round(videos.reduce((sum, vid) => sum + Math.min(100, videoWatchState[vid.videoId] || 0), 0) / videos.length)
    : 0
  const allVideosWatched = videos.length > 0 && videos.every(vid => (videoWatchState[vid.videoId] || 0) >= 90)
  const isCurrentChapterComplete = activeChapter && completedChapterIds.has(activeChapter.chapterId)

  // Check if current module's chapters are all done (for showing quiz)
  const currentModuleChapsDone = activeModule
    && (moduleChapters[activeModule.moduleId] || []).length > 0
    && (moduleChapters[activeModule.moduleId] || []).every(ch => completedChapterIds.has(ch.chapterId))

  const currentModuleQuiz = activeModule ? quizStatuses[activeModule.moduleId] : null
  const showQuizButton = currentModuleChapsDone && currentModuleQuiz?.hasQuiz && !currentModuleQuiz?.passed

  const syllabus = (
    <nav className="card cv-nav">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h2 style={{ margin: 0 }}>Syllabus</h2>
        <span className="tag tag-outline" style={{ fontSize: '0.65rem' }}>{courseCompletionPercent}% complete</span>
      </div>
      {/* Course progress bar */}
      <div className="cv-chapter-progress" style={{ marginBottom: '1rem' }}>
        <div className="cv-chapter-progress-bar">
          <div className="cv-chapter-progress-fill" style={{ width: `${courseCompletionPercent}%` }} />
        </div>
      </div>
      {loading ? (
        <p className="muted">Loading...</p>
      ) : (
        <ul className="stack">
          {modules.map((mod, idx) => {
            const unlocked = isModuleUnlocked(idx)
            const completed = isModuleCompleted(mod.moduleId)
            const modChaps = moduleChapters[mod.moduleId] || []
            const completedCount = modChaps.filter(ch => completedChapterIds.has(ch.chapterId)).length
            const qs = quizStatuses[mod.moduleId]

            return (
              <li key={mod.moduleId}>
                <button
                  className={`btn btn-block ${activeModule?.moduleId === mod.moduleId ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => loadChaptersForModule(mod, idx)}
                  disabled={!unlocked}
                  style={{ opacity: unlocked ? 1 : 0.45, textAlign: 'left', justifyContent: 'flex-start' }}
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
                            className={`btn btn-block btn-sm ${activeChapter?.chapterId === chap.chapterId && !showQuiz ? 'btn-secondary' : 'btn-ghost'}`}
                            onClick={() => handleChapterSelect(chap)}
                            style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%' }}>
                              {isDone ? (
                                <span style={{ color: 'var(--emerald)', fontSize: '0.9rem', flexShrink: 0 }}>✓</span>
                              ) : (
                                <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid var(--border-strong)', flexShrink: 0 }} />
                              )}
                              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {chap.chapterName}
                              </span>
                            </span>
                          </button>
                        </li>
                      )
                    })}
                    {/* Quiz button in syllabus */}
                    {qs?.hasQuiz && (
                      <li style={{ marginTop: '0.75rem' }}>
                        <button
                          className={`btn btn-block btn-sm ${showQuiz ? 'btn-secondary' : qs.passed ? 'btn-ghost' : 'btn-primary'}`}
                          onClick={handleOpenQuiz}
                          disabled={!currentModuleChapsDone}
                          style={{ opacity: currentModuleChapsDone ? 1 : 0.45, textAlign: 'left', justifyContent: 'flex-start' }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%' }}>
                            {qs.passed ? (
                              <span style={{ color: 'var(--emerald)', fontSize: '0.9rem', flexShrink: 0 }}>✓</span>
                            ) : (
                              <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>📝</span>
                            )}
                            <span>Module Test</span>
                            {qs.passed && <span className="tag tag-outline" style={{ fontSize: '0.6rem', marginLeft: 'auto' }}>Passed</span>}
                          </span>
                        </button>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </nav>
  )

  // ── Quiz Content ──
  const quizContent = showQuiz && quizData ? (
    <main className="card cv-main" style={{ minHeight: '400px' }}>
      {quizResult ? (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>
            {quizResult.passed ? '🎉 Congratulations!' : '📝 Quiz Results'}
          </h2>
          <div className={`quiz-result-card ${quizResult.passed ? 'quiz-result-passed' : 'quiz-result-failed'}`}>
            <div className="quiz-result-score">{quizResult.score}%</div>
            <div className="quiz-result-meta">
              {quizResult.correctAnswers}/{quizResult.totalQuestions} correct · Passing: {quizResult.passingScore}%
            </div>
            <div className={`quiz-result-badge ${quizResult.passed ? 'badge-pass' : 'badge-fail'}`}>
              {quizResult.passed ? '✓ PASSED' : '✗ NOT PASSED'}
            </div>
          </div>

          {/* Review answers */}
          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Review</h3>
          {quizResult.review?.map((q, i) => (
            <div key={q.questionId} className={`quiz-review-item ${q.isCorrect ? 'quiz-review-correct' : 'quiz-review-wrong'}`}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{i + 1}. {q.questionText}</p>
              <div className="quiz-options-grid">
                {q.options?.map((opt, j) => (
                  <div key={j} className={`quiz-option ${j === q.correctOptionIndex ? 'quiz-option-correct' : ''} ${j === q.userAnswer && !q.isCorrect ? 'quiz-option-wrong' : ''}`}>
                    {opt}
                    {j === q.correctOptionIndex && <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>✓ Correct</span>}
                    {j === q.userAnswer && j !== q.correctOptionIndex && <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>✗ Your answer</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {!quizResult.passed && (
            <button type="button" className="btn btn-primary" style={{ marginTop: '1.5rem' }}
              onClick={() => { setQuizResult(null); setQuizAnswers(new Array(quizData.questions?.length || 0).fill(-1)) }}>
              Retry Quiz
            </button>
          )}
        </div>
      ) : (
        <div>
          <h2 style={{ marginBottom: '0.5rem' }}>{quizData.title || 'Module Test'}</h2>
          {quizData.description && <p className="muted" style={{ marginBottom: '1.5rem' }}>{quizData.description}</p>}
          <p className="muted" style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            Passing score: <strong>{quizData.passingScore}%</strong>
            {quizData.timeLimitMinutes > 0 && <> · Time limit: <strong>{quizData.timeLimitMinutes} min</strong></>}
            {quizData.passed && <span className="cv-complete-badge" style={{ marginLeft: '0.75rem' }}>✓ Already Passed</span>}
          </p>

          {quizData.questions?.map((q, i) => (
            <div key={q.questionId} className="quiz-question-card">
              <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{i + 1}. {q.questionText}</p>
              <div className="quiz-options-grid">
                {q.options?.map((opt, j) => (
                  <label key={j} className={`quiz-option quiz-option-selectable ${quizAnswers[i] === j ? 'quiz-option-selected' : ''}`}>
                    <input type="radio" name={`q-${i}`} checked={quizAnswers[i] === j}
                      onChange={() => setQuizAnswers(prev => { const n = [...prev]; n[i] = j; return n })}
                      style={{ display: 'none' }}
                    />
                    <span className="quiz-radio">{quizAnswers[i] === j ? '●' : '○'}</span>
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button type="button" className="btn btn-primary" style={{ marginTop: '1.5rem' }}
            onClick={handleSubmitQuiz} disabled={quizSubmitting || quizAnswers.some(a => a === -1)}>
            {quizSubmitting ? 'Submitting…' : 'Submit Quiz'}
          </button>
          {quizAnswers.some(a => a === -1) && (
            <p className="muted" style={{ fontSize: '0.78rem', marginTop: '0.5rem' }}>Answer all questions to submit</p>
          )}
        </div>
      )}
    </main>
  ) : null

  const content = showQuiz ? quizContent : (
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
          {showQuizButton && (
            <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleOpenQuiz}>
              📝 Take Module Test
            </button>
          )}
        </div>
      ) : (
        <article>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #3d3b45', paddingBottom: '1rem', marginBottom: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0 }}>{activeChapter.chapterName}</h2>
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
                  <span className="tag tag-outline" style={{ fontSize: '0.65rem' }}>{chapterVideoPercent}% overall</span>
                )}
              </div>
              {!isCurrentChapterComplete && (
                <div className="cv-chapter-progress">
                  <div className="cv-chapter-progress-bar">
                    <div className="cv-chapter-progress-fill" style={{ width: `${chapterVideoPercent}%` }} />
                  </div>
                  <span className="muted" style={{ fontSize: '0.72rem' }}>
                    {allVideosWatched ? 'All videos watched — completing soon…' : 'Watch all videos to complete this chapter'}
                  </span>
                </div>
              )}
              {videos.map(vid => (
                <div key={vid.id || vid.videoId} style={{ marginTop: '1.25rem' }}>
                  <VideoPlayer src={vid.videoUrl} videoId={vid.videoId} onProgress={handleVideoProgress} />
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

      {error && <div className="alert alert-error" style={{ cursor: 'pointer' }} onClick={() => setError('')}>{error}</div>}

      <div className="cv-tabs">
        <button type="button" className={`cv-tab ${mobileView === 'syllabus' ? 'cv-tab-active' : ''}`} onClick={() => setMobileView('syllabus')}>📚 Syllabus</button>
        <button type="button" className={`cv-tab ${mobileView === 'content' ? 'cv-tab-active' : ''}`} onClick={() => setMobileView('content')}>📖 {showQuiz ? 'Quiz' : activeChapter ? activeChapter.chapterName : 'Content'}</button>
      </div>
      <div className="cv-mobile-view">{mobileView === 'syllabus' ? syllabus : content}</div>
      <div className="cv-body">{syllabus}{content}</div>
    </div>
  )
}
