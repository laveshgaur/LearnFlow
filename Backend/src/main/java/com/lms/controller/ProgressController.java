package com.lms.controller;

import com.lms.model.*;
import com.lms.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/user/progress")
public class ProgressController {

    /** Minimum seconds a user must spend on a chapter before it can auto-complete. */
    private static final int MIN_TIME_SECONDS = 30;

    /** Minimum video watch percentage (0–100) for a video to count as "watched". */
    private static final double VIDEO_WATCH_THRESHOLD = 90.0;

    @Autowired
    private ChapterProgressService progressService;

    @Autowired
    private VideoProgressService videoProgressService;

    @Autowired
    private ChapterService chapterService;

    @Autowired
    private VideoService videoService;

    @Autowired
    private UserService userService;

    @Autowired
    private QuizService quizService;

    @Autowired
    private ModuleService moduleService;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        String username = auth.getName();
        if (username == null || username.isEmpty()) return null;
        return userService.getUserByUsername(username);
    }

    // ───────────── Chapter-level progress ─────────────

    /**
     * GET /user/progress/course/{courseId}
     * Returns chapter progress (completed flag, timeSpent, video watch data) for the user.
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getCourseProgress(@PathVariable int courseId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<ChapterProgress> progress = progressService.getProgressForCourse(user.getId(), courseId);
        List<Map<String, Object>> result = progress.stream().map(cp -> {
            Map<String, Object> m = new HashMap<>();
            m.put("chapterId", cp.getChapter().getChapterId());
            m.put("completed", cp.isCompleted());
            m.put("completedAt", cp.getCompletedAt() != null ? cp.getCompletedAt().toString() : null);
            m.put("timeSpentSeconds", cp.getTimeSpentSeconds());
            return m;
        }).collect(Collectors.toList());

        // Also include per-module quiz pass status
        List<com.lms.model.Module> modules = moduleService.getModulesByCourseId(courseId);
        List<Map<String, Object>> quizStatuses = new ArrayList<>();
        if (modules != null) {
            for (com.lms.model.Module mod : modules) {
                quizService.getQuizByModuleId(mod.getModuleId()).ifPresent(quiz -> {
                    Map<String, Object> qs = new HashMap<>();
                    qs.put("moduleId", mod.getModuleId());
                    qs.put("quizId", quiz.getQuizId());
                    qs.put("passed", quizService.hasUserPassedQuiz(user.getId(), quiz.getQuizId()));
                    quizStatuses.add(qs);
                });
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("chapters", result);
        response.put("quizStatuses", quizStatuses);

        return ResponseEntity.ok(response);
    }

    // ───────────── Video watch progress ─────────────

    /**
     * POST /user/progress/video/{videoId}
     * Body: { "watchPercent": 85.5, "lastPosition": 142.3, "chapterId": 7, "timeSpentDelta": 15 }
     *
     * Saves video watch progress. If all videos in the chapter are ≥90% watched
     * AND the user has spent ≥30 seconds on the chapter, auto-completes the chapter.
     *
     * Returns the updated state including whether the chapter just became complete.
     */
    @PostMapping("/video/{videoId}")
    public ResponseEntity<?> updateVideoProgress(
            @PathVariable int videoId,
            @RequestBody Map<String, Object> body) {

        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Video video = videoService.getVideoById(videoId);
        if (video == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Video not found");
        }

        double watchPercent = toDouble(body.get("watchPercent"));
        double lastPosition = toDouble(body.get("lastPosition"));
        int chapterId = toInt(body.get("chapterId"));
        int timeSpentDelta = toInt(body.get("timeSpentDelta"));

        // Save video progress
        VideoProgress vp = videoProgressService.saveProgress(user, video, watchPercent, lastPosition);

        // Update chapter time-spent
        Chapter chapter = chapterService.getChapterById(chapterId);
        if (chapter == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Chapter not found");
        }

        ChapterProgress cp = progressService.getOrCreate(user, chapter);
        if (timeSpentDelta > 0 && timeSpentDelta < 120) {
            // Clamp delta to avoid cheating (max 2 min per heartbeat)
            cp.setTimeSpentSeconds(cp.getTimeSpentSeconds() + timeSpentDelta);
            progressService.save(cp);
        }

        // ── Auto-complete check ──
        boolean justCompleted = false;
        if (!cp.isCompleted()) {
            List<Video> chapterVideos = videoService.getVideosByChapterId(chapterId);
            boolean allWatched = videoProgressService.areAllVideosWatched(
                    user.getId(), chapterId, chapterVideos, VIDEO_WATCH_THRESHOLD);
            boolean enoughTime = cp.getTimeSpentSeconds() >= MIN_TIME_SECONDS;

            // Chapters with no videos auto-complete on time threshold alone
            if (allWatched && enoughTime) {
                cp.setCompleted(true);
                cp.setCompletedAt(LocalDateTime.now());
                progressService.save(cp);
                justCompleted = true;
            }
        }

        // Build response
        Map<String, Object> result = new HashMap<>();
        result.put("videoId", vp.getVideo().getVideoId());
        result.put("watchPercent", vp.getWatchPercent());
        result.put("lastPosition", vp.getLastPosition());
        result.put("chapterCompleted", cp.isCompleted());
        result.put("justCompleted", justCompleted);
        result.put("timeSpentSeconds", cp.getTimeSpentSeconds());

        return ResponseEntity.ok(result);
    }

    /**
     * GET /user/progress/videos/{chapterId}
     * Returns per-video watch progress for a chapter.
     */
    @GetMapping("/videos/{chapterId}")
    public ResponseEntity<?> getVideoProgressForChapter(@PathVariable int chapterId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<VideoProgress> progress = videoProgressService.getProgressForChapter(user.getId(), chapterId);
        List<Map<String, Object>> result = progress.stream().map(vp -> {
            Map<String, Object> m = new HashMap<>();
            m.put("videoId", vp.getVideo().getVideoId());
            m.put("watchPercent", vp.getWatchPercent());
            m.put("lastPosition", vp.getLastPosition());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ───────────── Manual chapter completion ─────────────

    /**
     * POST /user/progress/chapter/{chapterId}/complete
     * Allows the user to manually mark a chapter as complete.
     * Designed for chapters that have no videos (text-only content).
     */
    @PostMapping("/chapter/{chapterId}/complete")
    public ResponseEntity<?> markChapterComplete(@PathVariable int chapterId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Chapter chapter = chapterService.getChapterById(chapterId);
        if (chapter == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Chapter not found");
        }

        // Only allow manual completion if the chapter has no videos
        List<Video> chapterVideos = videoService.getVideosByChapterId(chapterId);
        if (chapterVideos != null && !chapterVideos.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("This chapter contains videos — it will be completed automatically when you watch them.");
        }

        ChapterProgress cp = progressService.markComplete(user, chapter);

        Map<String, Object> result = new HashMap<>();
        result.put("chapterId", chapterId);
        result.put("completed", cp.isCompleted());
        result.put("completedAt", cp.getCompletedAt() != null ? cp.getCompletedAt().toString() : null);

        return ResponseEntity.ok(result);
    }

    // ───────────── Helpers ─────────────

    private static double toDouble(Object val) {
        if (val instanceof Number) return ((Number) val).doubleValue();
        try { return Double.parseDouble(String.valueOf(val)); } catch (Exception e) { return 0; }
    }

    private static int toInt(Object val) {
        if (val instanceof Number) return ((Number) val).intValue();
        try { return Integer.parseInt(String.valueOf(val)); } catch (Exception e) { return 0; }
    }
}
