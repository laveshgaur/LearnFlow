package com.lms.controller;

import com.lms.model.Chapter;
import com.lms.model.Course;
import com.lms.model.User;
import com.lms.model.Video;
import com.lms.service.ChapterService;
import com.lms.service.CourseService;
import com.lms.service.FileUploadService;
import com.lms.service.UserService;
import com.lms.service.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/instructor")
public class InstructorController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private FileUploadService fileUploadService;
    @Autowired
    private UserService userService;

    @Autowired
    private ChapterService chapterService;
    
    @Autowired
    private VideoService videoService;

    @GetMapping("/get-courses")
    public ResponseEntity<?> getCourses() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        String username = authentication.getName();
        if (username == null || username.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        User user = userService.getUserByUsername(username);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        List<Course> courses = courseService.getCoursesByUserId(user.getId());
        return new ResponseEntity<>(courses, HttpStatus.OK);
    }

    @PostMapping("/upload-video")
    public ResponseEntity<?> uploadVideo(
            @RequestParam int chapterId,
            @RequestParam String title,
            @RequestParam MultipartFile file) {

        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            String username = authentication.getName();
            User user = userService.getUserByUsername(username);

            if (user == null) {
                return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
            }

            // Validate chapter exists BEFORE uploading file
            Chapter chapter = chapterService.getChapterById(chapterId);
            if (chapter == null) {
                return new ResponseEntity<>("Chapter not found", HttpStatus.NOT_FOUND);
            }

            // Now upload file
            String url = fileUploadService.uploadFile(file);
            if (url == null || url.isEmpty()) {
                return new ResponseEntity<>("File upload failed", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            // Create and save video
            Video video = new Video();
            video.setVideoTitle(title);
            video.setVideoUrl(url);
            video.setDurationInSeconds(0);
            video.setChapter(chapter);

            Video savedVideo = videoService.saveVideo(video);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Video uploaded successfully");
            response.put("videoId", savedVideo.getVideoId());
            response.put("url", savedVideo.getVideoUrl());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Upload failed: " + e.getMessage());
            error.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            System.err.println("Video upload error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/create-course")
    public ResponseEntity<?> createCourse(@RequestBody Course course) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        String username = authentication.getName();
        if (username == null || username.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        User user = userService.getUserByUsername(username);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        course.setUser(user);
        return new ResponseEntity<>(courseService.createCourse(course), HttpStatus.CREATED);
    }

    @DeleteMapping("/delete-course/{courseId}")
    public ResponseEntity<?> deleteCourse(@PathVariable int courseId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        String username = authentication.getName();
        if (username == null || username.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        User user = userService.getUserByUsername(username);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Course existing = courseService.getCourseById(courseId);
        if (existing == null || existing.getUser() == null || !existing.getUser().getId().equals(user.getId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        courseService.deleteCourse(courseId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/update-course/{courseId}")
    public ResponseEntity<?> updateCourse(@PathVariable int courseId, @RequestBody Course incoming) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        String username = authentication.getName();
        if (username == null || username.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        User user = userService.getUserByUsername(username);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Course existing = courseService.getCourseById(courseId);
        if (existing == null || existing.getUser() == null || !existing.getUser().getId().equals(user.getId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        existing.setCourseName(incoming.getCourseName());
        existing.setCourseDescription(incoming.getCourseDescription());
        existing.setCourseDuration(incoming.getCourseDuration());
        existing.setCoursePrice(incoming.getCoursePrice());
        existing.setCourseImage(incoming.getCourseImage());
        existing.setCourseStatus(incoming.getCourseStatus());
        existing.setCourseUpdatedAt(java.time.OffsetDateTime.now().toString());
        courseService.updateCourse(existing);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
