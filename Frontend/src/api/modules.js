import { apiFetch } from './client.js'

export async function getModules(courseId, auth) {
  return apiFetch(`/course/${courseId}/modules`, { auth })
}

export async function createModule(courseId, auth, body) {
  return apiFetch(`/course/${courseId}/modules`, { method: 'POST', auth, body })
}

export async function updateModule(courseId, moduleId, auth, body) {
  return apiFetch(`/course/${courseId}/modules/${moduleId}`, { method: 'PUT', auth, body })
}

export async function deleteModule(courseId, moduleId, auth) {
  return apiFetch(`/course/${courseId}/modules/${moduleId}`, { method: 'DELETE', auth })
}

export async function getChapters(courseId, moduleId, auth) {
  return apiFetch(`/courses/${courseId}/modules/${moduleId}/chapters`, { auth })
}

export async function createChapter(courseId, moduleId, auth, body) {
  return apiFetch(`/courses/${courseId}/modules/${moduleId}/chapters`, { method: 'POST', auth, body })
}

export async function updateChapter(courseId, moduleId, chapterId, auth, body) {
  return apiFetch(`/courses/${courseId}/modules/${moduleId}/chapters/${chapterId}`, { method: 'PUT', auth, body })
}

export async function deleteChapter(courseId, moduleId, chapterId, auth) {
  return apiFetch(`/courses/${courseId}/modules/${moduleId}/chapters/${chapterId}`, { method: 'DELETE', auth })
}
