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

export async function uploadVideo(token, chapterId, title, file) {
  const formData = new FormData()
  formData.append('chapterId', chapterId)
  formData.append('title', title)
  formData.append('file', file)

  const h = new Headers()
  if (token) {
    h.set('Authorization', bearerHeader(token))
  }

  const res = await fetch(getApiBase() + '/instructor/upload-video', {
    method: 'POST',
    headers: h,
    body: formData,
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

export async function deleteVideo(token, videoId) {
  return apiFetch(`/instructor/delete-video/${videoId}`, { method: 'DELETE', token })
}
