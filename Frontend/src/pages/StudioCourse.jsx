import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { 
  getModules, createModule, updateModule, deleteModule,
  getChapters, createChapter, updateChapter, deleteChapter,
  getVideos
} from '../api/modules.js'
import { uploadVideo, deleteVideo } from '../api/client.js'

export default function StudioCourse() {
  const { courseId } = useParams()
  const { credentials, isAuthenticated } = useAuth()
  const [modules, setModules] = useState([])
  const [activeModule, setActiveModule] = useState(null)
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Module form
  const [moduleName, setModuleName] = useState('')
  const [moduleDesc, setModuleDesc] = useState('Module Description')
  const [moduleDuration, setModuleDuration] = useState('1h')
  const [moduleStatus, setModuleStatus] = useState('PUBLISHED')

  // Chapter form
  const [chapterName, setChapterName] = useState('')
  const [chapterDescription, setChapterDescription] = useState('')

  // Edit states
  const [editingModule, setEditingModule] = useState(null)
  const [editModuleBusy, setEditModuleBusy] = useState(false)
  const [editingChapter, setEditingChapter] = useState(null)
  const [editChapterBusy, setEditChapterBusy] = useState(false)

  // Videos per chapter: { [chapterId]: Video[] }
  const [chapterVideos, setChapterVideos] = useState({})
  const [uploadingChapterId, setUploadingChapterId] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [deletingVideoId, setDeletingVideoId] = useState(null)

  // Expanded chapters
  const [expandedChapters, setExpandedChapters] = useState(new Set())

  function showSuccess(msg) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const loadModules = useCallback(async () => {
    if (!credentials) return
    setLoading(true)
    try {
      const ms = await getModules(courseId, credentials.token)
      setModules(Array.isArray(ms) ? ms : [])
      setActiveModule(null)
      setChapters([])
      setChapterVideos({})
    } catch (e) {
      if (e.status !== 204) setError(e.message || 'Failed to load modules')
    } finally {
      setLoading(false)
    }
  }, [courseId, credentials])

  useEffect(() => {
    if (isAuthenticated && credentials) loadModules()
  }, [isAuthenticated, credentials, loadModules])

  async function loadChapters(modId) {
    try {
      const chs = await getChapters(courseId, modId, credentials.token)
      const chapList = Array.isArray(chs) ? chs : []
      setChapters(chapList)
      // Load videos for each chapter in parallel
      const entries = await Promise.all(
        chapList.map(async (chap) => {
          try {
            const vids = await getVideos(courseId, modId, chap.chapterId, credentials.token)
            return [chap.chapterId, Array.isArray(vids) ? vids : []]
          } catch {
            return [chap.chapterId, []]
          }
        })
      )
      setChapterVideos(Object.fromEntries(entries))
    } catch (e) {
      console.error('No chapters', e)
      setChapters([])
      setChapterVideos({})
    }
  }

  function handleSelectModule(mod) {
    setActiveModule(mod)
    loadChapters(mod.moduleId)
  }

  async function handleAddModule(e) {
    e.preventDefault()
    if (!moduleName.trim()) return
    try {
      await createModule(courseId, credentials.token, {
        moduleName: moduleName.trim(),
        moduleDescription: moduleDesc.trim() || 'Module Description',
        moduleDuration: moduleDuration.trim() || '1h',
        modulePrice: '0',
        moduleImage: 'no-image.png',
        moduleStatus: moduleStatus
      })
      setModuleName('')
      setModuleDesc('Module Description')
      setModuleDuration('1h')
      setModuleStatus('PUBLISHED')
      showSuccess('Module created successfully!')
      loadModules()
    } catch (e) {
      setError(e.message || 'Error creating module')
    }
  }

  function startEditModule(mod) {
    setEditingModule({
      moduleId: mod.moduleId,
      moduleName: mod.moduleName || '',
      moduleDescription: mod.moduleDescription || '',
      moduleDuration: mod.moduleDuration || '',
      moduleStatus: mod.moduleStatus || 'PUBLISHED',
    })
  }

  async function handleSaveModule(e) {
    e.preventDefault()
    if (!editingModule) return
    setEditModuleBusy(true)
    try {
      await updateModule(courseId, editingModule.moduleId, credentials.token, {
        moduleName: editingModule.moduleName.trim(),
        moduleDescription: editingModule.moduleDescription.trim(),
        moduleDuration: editingModule.moduleDuration.trim(),
        modulePrice: '0',
        moduleImage: 'no-image.png',
        moduleStatus: editingModule.moduleStatus
      })
      setEditingModule(null)
      showSuccess('Module updated!')
      loadModules()
    } catch (e) {
      setError(e.message || 'Error updating module')
    } finally {
      setEditModuleBusy(false)
    }
  }

  async function handleDeleteModule(modId) {
    if (!window.confirm('Delete this module and all its chapters?')) return
    try {
      await deleteModule(courseId, modId, credentials.token)
      showSuccess('Module deleted.')
      loadModules()
    } catch (e) {
      setError(e.message || 'Error deleting module')
    }
  }

  async function handleAddChapter(e) {
    e.preventDefault()
    if (!activeModule || !chapterName.trim()) return
    try {
      await createChapter(courseId, activeModule.moduleId, credentials.token, {
        chapterName: chapterName.trim(),
        chapterDescription: chapterDescription.trim()
      })
      setChapterName('')
      setChapterDescription('')
      showSuccess('Chapter added!')
      loadChapters(activeModule.moduleId)
    } catch (e) {
      setError(e.message || 'Error creating chapter')
    }
  }

  function startEditChapter(chap) {
    setEditingChapter({
      chapterId: chap.chapterId,
      chapterName: chap.chapterName || '',
      chapterDescription: chap.chapterDescription || '',
    })
  }

  async function handleSaveChapter(e) {
    e.preventDefault()
    if (!editingChapter || !activeModule) return
    setEditChapterBusy(true)
    try {
      await updateChapter(courseId, activeModule.moduleId, editingChapter.chapterId, credentials.token, {
        chapterName: editingChapter.chapterName.trim(),
        chapterDescription: editingChapter.chapterDescription.trim()
      })
      setEditingChapter(null)
      showSuccess('Chapter updated!')
      loadChapters(activeModule.moduleId)
    } catch (e) {
      setError(e.message || 'Error updating chapter')
    } finally {
      setEditChapterBusy(false)
    }
  }

  async function handleDeleteChapter(chapId) {
    if (!window.confirm('Delete this chapter?')) return
    try {
      await deleteChapter(courseId, activeModule.moduleId, chapId, credentials.token)
      showSuccess('Chapter deleted.')
      loadChapters(activeModule.moduleId)
    } catch (e) {
      setError(e.message || 'Error deleting chapter')
    }
  }

  function toggleChapterExpand(chapId) {
    setExpandedChapters(prev => {
      const next = new Set(prev)
      next.has(chapId) ? next.delete(chapId) : next.add(chapId)
      return next
    })
  }

  async function handleVideoUpload(e, chapId) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingChapterId(chapId)
    setUploadProgress(0)
    try {
      await uploadVideo(credentials.token, chapId, file.name, file, (percent) => {
        setUploadProgress(percent)
      })
      // Refresh videos for this chapter only
      const vids = await getVideos(courseId, activeModule.moduleId, chapId, credentials.token)
      setChapterVideos((prev) => ({ ...prev, [chapId]: Array.isArray(vids) ? vids : [] }))
      showSuccess('Video uploaded!')
    } catch (err) {
      setError(err.message || 'Error uploading video')
    } finally {
      setUploadingChapterId(null)
      setUploadProgress(0)
      e.target.value = ''
    }
  }

  async function handleDeleteVideo(videoId, chapId) {
    if (!window.confirm('Delete this video? This cannot be undone.')) return
    setDeletingVideoId(videoId)
    try {
      await deleteVideo(credentials.token, videoId)
      setChapterVideos((prev) => ({
        ...prev,
        [chapId]: (prev[chapId] || []).filter((v) => v.videoId !== videoId),
      }))
      showSuccess('Video deleted.')
    } catch (e) {
      setError(e.message || 'Error deleting video')
    } finally {
      setDeletingVideoId(null)
    }
  }

  if (!isAuthenticated) return <p>Unauthorized</p>

  return (
    <div className="page-wide studio-page">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <Link to="/studio" className="btn btn-ghost btn-sm">
            &larr; Back to Studio
          </Link>
          <Link to={`/studio/course/${courseId}/analytics`} className="btn btn-secondary btn-sm">
            📊 Analytics
          </Link>
        </div>
        <h1>Course Builder</h1>
        <p className="lede">Manage Modules &amp; Chapters for Course {courseId}</p>
      </header>

      {error && (
        <div className="alert alert-error" style={{ cursor: 'pointer' }} onClick={() => setError('')}>
          ⚠ {error}
          <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: '0.8rem' }}>Click to dismiss</span>
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success">
          ✓ {successMsg}
        </div>
      )}

      <div className="studio-builder-layout">
        {/* ─── MODULES PANEL ─── */}
        <section className="card studio-builder-modules">
          <div className="panel-head">
            <h2>📦 Modules</h2>
            <span className="tag tag-outline">{modules.length} total</span>
          </div>

          {loading ? (
            <div className="skeleton" style={{ height: 100 }} />
          ) : (
            <ul className="stack">
              {modules.map((mod) => (
                <li
                  key={mod.moduleId}
                  className={`studio-module-item ${activeModule?.moduleId === mod.moduleId ? 'studio-module-active' : ''}`}
                  onClick={() => handleSelectModule(mod)}
                >
                  <div className="studio-module-header">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, wordBreak: 'break-word' }}>{mod.moduleName}</div>
                      <div className="muted" style={{ fontSize: '0.78rem', marginTop: '0.15rem' }}>
                        {mod.moduleDuration} · <span className="tag tag-outline" style={{ fontSize: '0.6rem' }}>{mod.moduleStatus}</span>
                      </div>
                    </div>
                    <div className="studio-module-actions" onClick={e => e.stopPropagation()}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => startEditModule(mod)} title="Edit module">
                        ✏️
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm danger-text" onClick={() => handleDeleteModule(mod.moduleId)} title="Delete module">
                        🗑️
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Add Module Form */}
          <div className="studio-add-section">
            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>Add New Module</h3>
            <form className="form-grid" onSubmit={handleAddModule}>
              <div>
                <label className="label" htmlFor="new-mod-name">Module Title *</label>
                <input
                  id="new-mod-name"
                  className="input"
                  placeholder="e.g., Introduction to React"
                  required
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="new-mod-desc">Description</label>
                <textarea
                  id="new-mod-desc"
                  className="textarea textarea-sm"
                  value={moduleDesc}
                  onChange={(e) => setModuleDesc(e.target.value)}
                />
              </div>
              <div className="form-grid-2">
                <div>
                  <label className="label" htmlFor="new-mod-dur">Duration</label>
                  <input
                    id="new-mod-dur"
                    className="input"
                    value={moduleDuration}
                    onChange={(e) => setModuleDuration(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="new-mod-status">Status</label>
                  <select
                    id="new-mod-status"
                    className="select"
                    value={moduleStatus}
                    onChange={(e) => setModuleStatus(e.target.value)}
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                + Add Module
              </button>
            </form>
          </div>
        </section>

        {/* ─── CHAPTERS PANEL ─── */}
        <section className="card card-ghost studio-builder-chapters">
          {!activeModule ? (
            <div className="empty-state" style={{ padding: '3rem 1.5rem' }}>
              <div className="empty-icon">📑</div>
              <p className="muted">Select a module to view and manage its chapters</p>
            </div>
          ) : (
            <>
              <div className="panel-head">
                <h2>📖 Chapters for <em style={{ color: 'var(--indigo-light)' }}>{activeModule.moduleName}</em></h2>
                <span className="tag tag-outline">{chapters.length} chapters</span>
              </div>

              <ul className="stack">
                {chapters.map((chap) => {
                  const videos = chapterVideos[chap.chapterId] || []
                  const isExpanded = expandedChapters.has(chap.chapterId)

                  return (
                    <li key={chap.chapterId} className="studio-chapter-card">
                      {/* Chapter Header */}
                      <div className="studio-chapter-header" onClick={() => toggleChapterExpand(chap.chapterId)}>
                        <span className="studio-chapter-expand">{isExpanded ? '▾' : '▸'}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: '0.95rem', margin: 0, wordBreak: 'break-word' }}>{chap.chapterName}</h3>
                          <div className="muted" style={{ fontSize: '0.75rem', marginTop: '0.15rem' }}>
                            {videos.length} video{videos.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="studio-chapter-actions" onClick={e => e.stopPropagation()}>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => startEditChapter(chap)} title="Edit chapter">
                            ✏️
                          </button>
                          <button type="button" className="btn btn-ghost btn-sm danger-text" onClick={() => handleDeleteChapter(chap.chapterId)} title="Delete chapter">
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="studio-chapter-body">
                          {chap.chapterDescription && (
                            <p className="muted" style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap', marginBottom: '0.75rem', wordBreak: 'break-word' }}>
                              {chap.chapterDescription}
                            </p>
                          )}

                          {/* Videos list */}
                          {videos.length > 0 && (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                              {videos.map((vid) => (
                                <li
                                  key={vid.videoId}
                                  className="studio-video-item"
                                >
                                  <span className="studio-video-title">
                                    🎬 {vid.videoTitle}
                                  </span>
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-sm danger-text"
                                    disabled={deletingVideoId === vid.videoId}
                                    onClick={() => handleDeleteVideo(vid.videoId, chap.chapterId)}
                                    style={{ flexShrink: 0 }}
                                  >
                                    {deletingVideoId === vid.videoId ? 'Deleting…' : 'Delete'}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}

                          {/* Upload video */}
                          <div style={{ marginTop: '0.5rem' }}>
                            <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
                              {uploadingChapterId === chap.chapterId
                                ? (uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Saving...')
                                : '📎 Upload Video'}
                              <input
                                type="file"
                                accept="video/*"
                                style={{ display: 'none' }}
                                onChange={(e) => handleVideoUpload(e, chap.chapterId)}
                                disabled={uploadingChapterId === chap.chapterId}
                              />
                            </label>
                            {uploadingChapterId === chap.chapterId && (
                              <div className="studio-upload-bar">
                                <div className="studio-upload-fill" style={{ width: `${uploadProgress}%` }} />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>

              {/* Add Chapter Form */}
              <div className="studio-add-section">
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>Add New Chapter</h3>
                <form className="form-grid" onSubmit={handleAddChapter}>
                  <div>
                    <label className="label">Chapter Title *</label>
                    <input
                      className="input"
                      required
                      placeholder="e.g., Setting up your environment"
                      value={chapterName}
                      onChange={(e) => setChapterName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Content</label>
                    <textarea
                      className="textarea"
                      required
                      placeholder="Chapter content / description..."
                      value={chapterDescription}
                      onChange={(e) => setChapterDescription(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm">
                    + Add Chapter
                  </button>
                </form>
              </div>
            </>
          )}
        </section>
      </div>

      {/* ─── Edit Module Modal ─── */}
      {editingModule && (
        <div className="modal-root" role="dialog" aria-modal="true">
          <button type="button" className="modal-scrim" aria-label="Close" onClick={() => setEditingModule(null)} />
          <div className="modal-card card">
            <h2>Edit Module</h2>
            <p className="modal-meta">Update module details below.</p>
            <form className="form-grid" onSubmit={handleSaveModule}>
              <div>
                <label className="label">Module Name</label>
                <input
                  className="input"
                  required
                  value={editingModule.moduleName}
                  onChange={(e) => setEditingModule(prev => ({ ...prev, moduleName: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="textarea"
                  value={editingModule.moduleDescription}
                  onChange={(e) => setEditingModule(prev => ({ ...prev, moduleDescription: e.target.value }))}
                />
              </div>
              <div className="form-grid-2">
                <div>
                  <label className="label">Duration</label>
                  <input
                    className="input"
                    value={editingModule.moduleDuration}
                    onChange={(e) => setEditingModule(prev => ({ ...prev, moduleDuration: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select
                    className="select"
                    value={editingModule.moduleStatus}
                    onChange={(e) => setEditingModule(prev => ({ ...prev, moduleStatus: e.target.value }))}
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                  </select>
                </div>
              </div>
              <div className="actions">
                <button type="submit" className="btn btn-primary" disabled={editModuleBusy}>
                  {editModuleBusy ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditingModule(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Edit Chapter Modal ─── */}
      {editingChapter && (
        <div className="modal-root" role="dialog" aria-modal="true">
          <button type="button" className="modal-scrim" aria-label="Close" onClick={() => setEditingChapter(null)} />
          <div className="modal-card card">
            <h2>Edit Chapter</h2>
            <p className="modal-meta">Update chapter details below.</p>
            <form className="form-grid" onSubmit={handleSaveChapter}>
              <div>
                <label className="label">Chapter Name</label>
                <input
                  className="input"
                  required
                  value={editingChapter.chapterName}
                  onChange={(e) => setEditingChapter(prev => ({ ...prev, chapterName: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Content</label>
                <textarea
                  className="textarea"
                  value={editingChapter.chapterDescription}
                  onChange={(e) => setEditingChapter(prev => ({ ...prev, chapterDescription: e.target.value }))}
                />
              </div>
              <div className="actions">
                <button type="submit" className="btn btn-primary" disabled={editChapterBusy}>
                  {editChapterBusy ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditingChapter(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
