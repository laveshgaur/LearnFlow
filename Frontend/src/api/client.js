/**
 * In dev, Vite proxies /api → Spring Boot (see vite.config.js).
 * For production against a different host, set VITE_API_URL (no trailing slash).
 */
export function getApiBase() {
  const fromEnv = import.meta.env.VITE_API_URL
  if (fromEnv) return String(fromEnv).replace(/\/$/, '')
  if (import.meta.env.DEV) return '/api'
  return ''
}

function joinUrl(path) {
  const base = getApiBase()
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

function bearerHeader(token) {
  return `Bearer ${token}`
}

export async function apiFetch(path, { method = 'GET', body, token, headers = {} } = {}) {
  const h = new Headers(headers)
  if (body !== undefined && !h.has('Content-Type')) {
    h.set('Content-Type', 'application/json')
  }
  if (token) {
    h.set('Authorization', bearerHeader(token))
  }
  const res = await fetch(joinUrl(path), {
    method,
    headers: h,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }
  if (!res.ok) {
    const err = new Error(res.statusText || 'Request failed')
    err.status = res.status
    err.body = data
    throw err
  }
  return data
}

/** POST /login → returns JWT token string */
export async function loginUser(username, password) {
  return apiFetch('/login', {
    method: 'POST',
    body: { userName: username, password },
  })
}

export async function createUserPublic(payload) {
  return apiFetch('/sign-up', { method: 'POST', body: payload })
}

export async function healthCheck() {
  return apiFetch('/health-check')
}

export async function getProfile(token) {
  return apiFetch('/user', { method: 'PUT', token })
}

export async function listUsersAdmin(token) {
  return apiFetch('/admin', { token })
}

export async function createUserAdmin(token, payload) {
  return apiFetch('/admin/create-user', { method: 'POST', token, body: payload })
}

/** Authenticated learner — enroll / purchase */
export async function purchaseCourse(token, courseId) {
  return apiFetch(`/user/purchase-course/${courseId}`, { method: 'POST', token })
}

/** Public catalog — no auth */
export async function listCourses() {
  return apiFetch('/courses')
}

/** Instructor-only (ROLE_INSTRUCTOR) */
export async function getInstructorCourses(token) {
  return apiFetch('/instructor/get-courses', { token })
}

export async function createCourse(token, payload) {
  return apiFetch('/instructor/create-course', { method: 'POST', token, body: payload })
}

export async function updateInstructorCourse(token, courseId, payload) {
  return apiFetch(`/instructor/update-course/${courseId}`, { method: 'PUT', token, body: payload })
}

export async function deleteInstructorCourse(token, courseId) {
  return apiFetch(`/instructor/delete-course/${courseId}`, { method: 'DELETE', token })
}

/**
 * Upload video directly to Cloudinary from the browser (signed upload),
 * then notify the backend to save the HLS URL in the database.
 *
 * Flow:
 *   1. GET /instructor/cloudinary-signature → { signature, timestamp, apiKey, cloudName, folder }
 *   2. POST to Cloudinary with the signature (video goes browser → Cloudinary, not through backend)
 *   3. POST /instructor/save-video → backend saves HLS URL in MySQL
 *
 * @param {string} token - JWT auth token
 * @param {number} chapterId - target chapter ID
 * @param {string} title - video title
 * @param {File} file - video file from input
 * @param {function} [onProgress] - optional (percent) => void callback
 */
export async function uploadVideo(token, chapterId, title, file, onProgress) {
  // Step 1: Get a signed upload signature from the backend
  const sigData = await apiFetch('/instructor/cloudinary-signature', { token })
  const { signature, timestamp, apiKey, cloudName, folder } = sigData

  // Step 2: Upload directly to Cloudinary with the signature
  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', apiKey)
  formData.append('timestamp', timestamp)
  formData.append('signature', signature)
  formData.append('folder', folder)

  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`

  const cloudinaryRes = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', cloudinaryUrl)

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        let errMsg = `Cloudinary upload failed (${xhr.status})`
        try {
          const body = JSON.parse(xhr.responseText)
          errMsg = body?.error?.message || errMsg
        } catch { /* ignore */ }
        reject(new Error(errMsg))
      }
    }
    xhr.onerror = () => reject(new Error('Network error during Cloudinary upload'))
    xhr.send(formData)
  })

  const { public_id: publicId, secure_url: videoUrl } = cloudinaryRes

  // Step 3: Tell the backend to save the HLS link in the DB
  return apiFetch('/instructor/save-video', {
    method: 'POST',
    token,
    body: { chapterId, title, publicId, videoUrl },
  })
}

export async function deleteVideo(token, videoId) {
  return apiFetch(`/instructor/delete-video/${videoId}`, { method: 'DELETE', token })
}
