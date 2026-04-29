import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { 
  getModules, createModule, updateModule, deleteModule,
  getChapters, createChapter, updateChapter, deleteChapter 
} from '../api/modules.js'
import { uploadVideo } from '../api/client.js'

export default function StudioCourse() {
  const { courseId } = useParams()
  const { credentials, isAuthenticated } = useAuth()
  const [modules, setModules] = useState([])
  const [activeModule, setActiveModule] = useState(null)
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [moduleName, setModuleName] = useState('')
  const [chapterName, setChapterName] = useState('')
  const [chapterDescription, setChapterDescription] = useState('')

  const loadModules = useCallback(async () => {
    if (!credentials) return
    setLoading(true)
    try {
      const ms = await getModules(courseId, credentials)
      setModules(Array.isArray(ms) ? ms : [])
      setActiveModule(null)
      setChapters([])
    } catch (e) {
      if (e.status !== 204) {
        setError(e.message || 'Failed to load modules')
      }
    } finally {
      setLoading(false)
    }
  }, [courseId, credentials])

  useEffect(() => {
    if (isAuthenticated && credentials) loadModules()
  }, [isAuthenticated, credentials, loadModules])

  async function loadChapters(modId) {
    try {
      const chs = await getChapters(courseId, modId, credentials)
      setChapters(Array.isArray(chs) ? chs : [])
    } catch (e) {
       console.error("No chapters", e)
       setChapters([])
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
      const ts = new Date().toISOString()
      await createModule(courseId, credentials, { 
        moduleName, 
        moduleDescription: 'Module Description', 
        moduleDuration: '1h', 
        modulePrice: '0', 
        moduleImage: 'no-image.png', 
        moduleStatus: 'PUBLISHED',
        moduleCreatedAt: ts,
        moduleUpdatedAt: ts
      })
      setModuleName('')
      loadModules()
    } catch (e) {
      setError(e.message || 'Error creating module')
    }
  }

  async function handleDeleteModule(modId) {
    if (!window.confirm('Delete this module?')) return
    try {
      await deleteModule(courseId, modId, credentials)
      loadModules()
    } catch (e) {
      setError(e.message || 'Error deleting module')
    }
  }

  async function handleAddChapter(e) {
    e.preventDefault()
    if (!activeModule || !chapterName.trim()) return
    try {
      const ts = new Date().toISOString()
      await createChapter(courseId, activeModule.moduleId, credentials, {
        chapterName,
        chapterDescription,
        chapterDuration: '10m',
        chapterPrice: '0',
        chapterImage: 'no-image.png',
        chapterCreatedAt: ts,
        chapterUpdatedAt: ts
      })
      setChapterName('')
      setChapterDescription('')
      loadChapters(activeModule.moduleId)
    } catch (e) {
      setError(e.message || 'Error creating chapter')
    }
  }

  const [uploadingChapterId, setUploadingChapterId] = useState(null)

  async function handleDeleteChapter(chapId) {
    if (!window.confirm('Delete this chapter?')) return
    try {
      await deleteChapter(courseId, activeModule.moduleId, chapId, credentials)
      loadChapters(activeModule.moduleId)
    } catch (e) {
      setError(e.message || 'Error deleting chapter')
    }
  }

  async function handleVideoUpload(e, chapId) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingChapterId(chapId);
    try {
      await uploadVideo(credentials, chapId, file.name, file);
      alert('Video uploaded successfully!');
      loadChapters(activeModule.moduleId);
    } catch (err) {
      setError(err.message || 'Error uploading video');
    } finally {
      setUploadingChapterId(null);
    }
  }

  if (!isAuthenticated) return <p>Unauthorized</p>

  return (
    <div className="page-wide studio-page">
      <header className="page-header">
        <Link to="/studio" className="btn btn-ghost btn-sm" style={{marginBottom: '1rem'}}>
          &larr; Back to Studio
        </Link>
        <h1>Course Builder</h1>
        <p className="lede">Manage Modules & Chapters for Course {courseId}</p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="studio-split">
        {/* MODULES LIST */}
        <section className="card studio-panel">
          <h2>Modules</h2>
          {loading ? <p>Loading modules...</p> : (
            <ul className="stack">
              {modules.map(mod => (
                <li key={mod.moduleId} className="card card-ghost" style={{display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', border: activeModule?.moduleId === mod.moduleId ? '1px solid #e8a838' : ''}} onClick={() => handleSelectModule(mod)}>
                  <span>{mod.moduleName}</span>
                  <div>
                    <button type="button" className="btn btn-ghost btn-sm danger-text" onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.moduleId)}}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <form className="form-grid" onSubmit={handleAddModule} style={{marginTop: '1rem'}}>
            <input 
              className="input" 
              placeholder="New module title..." 
              value={moduleName} 
              onChange={e => setModuleName(e.target.value)} 
            />
            <button type="submit" className="btn btn-primary btn-sm">Add Module</button>
          </form>
        </section>

        {/* CHAPTERS LIST */}
        <aside className="card card-ghost studio-side">
          {!activeModule ? (
             <p className="muted">Select a module to view/add chapters</p>
          ) : (
             <>
               <h2>Chapters for {activeModule.moduleName}</h2>
               <ul className="stack">
                  {chapters.map(chap => (
                    <li key={chap.chapterId} className="card">
                      <h3>{chap.chapterName}</h3>
                      <p className="muted">{chap.chapterDescription}</p>
                      
                      <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                        <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
                          {uploadingChapterId === chap.chapterId ? 'Uploading...' : 'Upload Video'}
                          <input 
                            type="file" 
                            accept="video/*" 
                            style={{ display: 'none' }} 
                            onChange={(e) => handleVideoUpload(e, chap.chapterId)}
                            disabled={uploadingChapterId === chap.chapterId}
                          />
                        </label>
                      </div>

                      <button type="button" className="btn btn-ghost btn-sm danger-text" onClick={() => handleDeleteChapter(chap.chapterId)}>
                        Delete
                      </button>
                    </li>
                  ))}
               </ul>

               <form className="form-grid" onSubmit={handleAddChapter} style={{marginTop: '1rem'}}>
                 <div>
                    <label className="label">Chapter Title</label>
                    <input 
                      className="input" required 
                      value={chapterName} onChange={e => setChapterName(e.target.value)} 
                    />
                 </div>
                 <div>
                    <label className="label">Content</label>
                    <textarea 
                      className="textarea" required 
                      value={chapterDescription} onChange={e => setChapterDescription(e.target.value)} 
                    />
                 </div>
                 <button type="submit" className="btn btn-primary btn-sm">Add Chapter</button>
               </form>
             </>
          )}
        </aside>
      </div>
    </div>
  )
}
