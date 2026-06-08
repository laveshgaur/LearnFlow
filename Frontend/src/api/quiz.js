import { apiFetch } from './client.js'

// ── Instructor: Quiz CRUD ──

export async function getQuizForModule(moduleId, token) {
  return apiFetch(`/instructor/quiz/module/${moduleId}`, { token })
}

export async function createQuiz(moduleId, token, body) {
  return apiFetch(`/instructor/quiz/module/${moduleId}`, { method: 'POST', token, body })
}

export async function updateQuiz(quizId, token, body) {
  return apiFetch(`/instructor/quiz/${quizId}`, { method: 'PUT', token, body })
}

export async function deleteQuiz(quizId, token) {
  return apiFetch(`/instructor/quiz/${quizId}`, { method: 'DELETE', token })
}

// ── Instructor: Questions CRUD ──

export async function addQuestion(quizId, token, body) {
  return apiFetch(`/instructor/quiz/${quizId}/questions`, { method: 'POST', token, body })
}

export async function updateQuestion(quizId, questionId, token, body) {
  return apiFetch(`/instructor/quiz/${quizId}/questions/${questionId}`, { method: 'PUT', token, body })
}

export async function deleteQuestion(quizId, questionId, token) {
  return apiFetch(`/instructor/quiz/${quizId}/questions/${questionId}`, { method: 'DELETE', token })
}

// ── Student: Quiz ──

export async function getStudentQuiz(moduleId, token) {
  return apiFetch(`/user/quiz/module/${moduleId}`, { token })
}

export async function submitQuiz(quizId, token, answers) {
  return apiFetch(`/user/quiz/${quizId}/submit`, { method: 'POST', token, body: { answers } })
}

export async function getQuizStatus(moduleId, token) {
  return apiFetch(`/user/quiz/status/module/${moduleId}`, { token })
}

// ── Instructor: Results ──

export async function getQuizResults(quizId, token) {
  return apiFetch(`/instructor/quiz/${quizId}/results`, { token })
}
