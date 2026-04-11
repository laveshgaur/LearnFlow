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

function basicHeader(username, password) {
  const token = btoa(`${username}:${password}`)
  return `Basic ${token}`
}

export async function apiFetch(path, { method = 'GET', body, auth, headers = {} } = {}) {
  const h = new Headers(headers)
  if (body !== undefined && !h.has('Content-Type')) {
    h.set('Content-Type', 'application/json')
  }
  if (auth?.username && auth?.password) {
    h.set('Authorization', basicHeader(auth.username, auth.password))
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

export async function createUserPublic(payload) {
  return apiFetch('/create-user', { method: 'POST', body: payload })
}

export async function healthCheck(auth) {
  return apiFetch('/health-check', { auth })
}

export async function getProfile(auth) {
  return apiFetch('/user', { method: 'PUT', auth })
}

export async function listUsersAdmin(auth) {
  return apiFetch('/admin', { auth })
}

/** Authenticated learner — enroll / purchase */
export async function purchaseCourse(auth, courseId) {
  return apiFetch(`/user/purchase-course/${courseId}`, { method: 'POST', auth })
}

/** Public catalog — no auth */
export async function listCourses() {
  return apiFetch('/courses')
}

/** Instructor-only (ROLE_INSTRUCTOR) */
export async function getInstructorCourses(auth) {
  return apiFetch('/instructor/get-courses', { auth })
}

export async function createCourse(auth, payload) {
  return apiFetch('/instructor/create-course', { method: 'POST', auth, body: payload })
}

export async function updateInstructorCourse(auth, courseId, payload) {
  return apiFetch(`/instructor/update-course/${courseId}`, { method: 'PUT', auth, body: payload })
}

export async function deleteInstructorCourse(auth, courseId) {
  return apiFetch(`/instructor/delete-course/${courseId}`, { method: 'DELETE', auth })
}
