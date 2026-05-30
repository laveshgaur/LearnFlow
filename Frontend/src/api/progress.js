import { apiFetch } from './client.js'

/**
 * GET /user/progress/course/{courseId}
 * Returns array of { chapterId, completed, completedAt, timeSpentSeconds } for the current user.
 */
export async function getCourseProgress(courseId, token) {
  return apiFetch(`/user/progress/course/${courseId}`, { token })
}

/**
 * POST /user/progress/video/{videoId}
 * Sends video watch progress. The backend auto-completes the chapter
 * when all videos ≥90% watched AND user spent ≥30s on the chapter.
 *
 * Body: { watchPercent, lastPosition, chapterId, timeSpentDelta }
 * Returns: { videoId, watchPercent, lastPosition, chapterCompleted, justCompleted, timeSpentSeconds }
 */
export async function updateVideoProgress(videoId, token, body) {
  return apiFetch(`/user/progress/video/${videoId}`, { method: 'POST', token, body })
}

/**
 * GET /user/progress/videos/{chapterId}
 * Returns per-video watch progress for a chapter.
 */
export async function getVideoProgress(chapterId, token) {
  return apiFetch(`/user/progress/videos/${chapterId}`, { token })
}

/**
 * GET /instructor/analytics/{courseId}
 * Returns per-course analytics metrics (instructor only).
 */
export async function getCourseAnalytics(courseId, token) {
  return apiFetch(`/instructor/analytics/${courseId}`, { token })
}
