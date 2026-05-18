import { apiFetch } from './client.js'

export async function getModules(courseId, token) {
  return apiFetch(`/course/${courseId}/modules`, { token })
}

export async function createModule(courseId, token, body) {
  return apiFetch(`/course/${courseId}/modules`, { method: 'POST', token, body })
}

export async function updateModule(courseId, moduleId, token, body) {
  return apiFetch(`/course/${courseId}/modules/${moduleId}`, { method: 'PUT', token, body })
}

export async function deleteModule(courseId, moduleId, token) {
  return apiFetch(`/course/${courseId}/modules/${moduleId}`, { method: 'DELETE', token })
}

export async function getChapters(courseId, moduleId, token) {
  return apiFetch(`/courses/${courseId}/modules/${moduleId}/chapters`, { token })
}

export async function createChapter(courseId, moduleId, token, body) {
  return apiFetch(`/courses/${courseId}/modules/${moduleId}/chapters`, { method: 'POST', token, body })
}

export async function updateChapter(courseId, moduleId, chapterId, token, body) {
  return apiFetch(`/courses/${courseId}/modules/${moduleId}/chapters/${chapterId}`, { method: 'PUT', token, body })
}

export async function deleteChapter(courseId, moduleId, chapterId, token) {
  return apiFetch(`/courses/${courseId}/modules/${moduleId}/chapters/${chapterId}`, { method: 'DELETE', token })
}

export async function getVideos(courseId, moduleId, chapterId, token) {
  return apiFetch(`/courses/${courseId}/modules/${moduleId}/chapters/${chapterId}/videos`, { token })
}
