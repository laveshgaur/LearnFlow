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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/instructor")
public class InstructorController {

    private static final Logger logger = LoggerFactory.getLogger(InstructorController.class);

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

   
    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        String username = authentication.getName();
        if (username == null || username.isEmpty()) {
            return null;
        }

        return userService.getUserByUsername(username);
    }

    @GetMapping("/get-courses")
    public ResponseEntity<?> getCourses() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Course> courses = courseService.getCoursesByUserId(user.getId());
        return ResponseEntity.ok(courses);
    }

    
    @PostMapping("/upload-video")
    public ResponseEntity<?> uploadVideo(
            @RequestParam int chapterId,
            @RequestParam String title,
            @RequestParam MultipartFile file) {

        try {
            User user = getAuthenticatedUser();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("video/")) {
                return ResponseEntity.badRequest().body("Only video files are allowed");
            }

            
            Chapter chapter = chapterService.getChapterById(chapterId);
            if (chapter == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Chapter not found");
            }
            
            String url = fileUploadService.uploadFile(file);
            if (url == null || url.isEmpty()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("File upload failed");
            }

            // Save video
            Video video = new Video();
            video.setVideoTitle(title);
            video.setVideoUrl(url);
            video.setDurationInSeconds(0); // Placeholder, can be updated later
            video.setChapter(chapter);

            Video savedVideo = videoService.saveVideo(video);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Video uploaded successfully");
            response.put("videoId", savedVideo.getVideoId());
            response.put("url", savedVideo.getVideoUrl());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Video upload error", e);

            Map<String, Object> error = new HashMap<>();
            error.put("error", "Upload failed: " + e.getMessage());
            error.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    
    @PostMapping("/create-course")
    public ResponseEntity<?> createCourse(@RequestBody Course course) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        course.setUser(user);
        Course created = courseService.createCourse(course);

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    
    @DeleteMapping("/delete-course/{courseId}")
    public ResponseEntity<?> deleteCourse(@PathVariable int courseId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Course existing = courseService.getCourseById(courseId);

        if (existing == null ||
            existing.getUser() == null ||
            !existing.getUser().getId().equals(user.getId())) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        courseService.deleteCourse(courseId);
        return ResponseEntity.noContent().build();
    }

    
    @PutMapping("/update-course/{courseId}")
    public ResponseEntity<?> updateCourse(
            @PathVariable int courseId,
            @RequestBody Course incoming) {

        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Course existing = courseService.getCourseById(courseId);

        if (existing == null ||
            existing.getUser() == null ||
            !existing.getUser().getId().equals(user.getId())) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

    
        existing.setCourseName(incoming.getCourseName());
        existing.setCourseDescription(incoming.getCourseDescription());
        existing.setCourseDuration(incoming.getCourseDuration());
        existing.setCoursePrice(incoming.getCoursePrice());
        existing.setCourseImage(incoming.getCourseImage());
        existing.setCourseStatus(incoming.getCourseStatus());
        existing.setCourseUpdatedAt(OffsetDateTime.now().toString());

        Course updated = courseService.updateCourse(existing);

        return ResponseEntity.ok(updated);
    }
}