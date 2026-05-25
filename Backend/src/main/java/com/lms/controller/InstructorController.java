package com.lms.controller;

import com.lms.model.Chapter;
import com.lms.model.Course;
import com.lms.model.User;
import com.lms.model.Video;
import com.lms.model.Module;
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
import java.util.stream.Collectors;
import com.lms.dto.request.CourseRequest;
import com.lms.dto.response.CourseResponse;
import com.lms.dto.mapper.DtoMapper;
import com.lms.dto.request.VideoUploadRequest;

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
        List<CourseResponse> responses = courses.stream()
                .map(DtoMapper::toCourseResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    
    /**
     * Generate a Cloudinary signature for direct signed uploads from the frontend.
     * The API secret never leaves the backend — only the computed signature is returned.
     */
    @GetMapping("/cloudinary-signature")
    public ResponseEntity<?> getCloudinarySignature() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        long timestamp = System.currentTimeMillis() / 1000L;

        Map<String, Object> paramsToSign = new java.util.TreeMap<>();
        paramsToSign.put("timestamp", timestamp);
        paramsToSign.put("folder", "lms_uploads");

        String signature = fileUploadService.generateSignature(paramsToSign);

        Map<String, Object> result = new HashMap<>();
        result.put("signature", signature);
        result.put("timestamp", timestamp);
        result.put("apiKey", fileUploadService.getApiKey());
        result.put("cloudName", fileUploadService.getCloudName());
        result.put("folder", "lms_uploads");

        return ResponseEntity.ok(result);
    }

    /**
     * Save video metadata after the frontend uploads directly to Cloudinary.
     * Accepts JSON with the Cloudinary response (publicId, videoUrl) instead
     * of a MultipartFile — this eliminates the bandwidth load on the backend.
     */
    @PostMapping("/save-video")
    public ResponseEntity<?> saveVideo(@RequestBody VideoUploadRequest request) {

        try {
            User user = getAuthenticatedUser();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            if (request.videoUrl() == null || request.videoUrl().isEmpty()) {
                return ResponseEntity.badRequest().body("Video URL is required");
            }

            if (request.publicId() == null || request.publicId().isEmpty()) {
                return ResponseEntity.badRequest().body("Public ID is required");
            }

            Chapter chapter = chapterService.getChapterById(request.chapterId());
            if (chapter == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Chapter not found");
            }

            // Convert the Cloudinary secure URL to HLS streaming URL
            String hlsUrl = fileUploadService.getHlsUrl(request.videoUrl());
            if (hlsUrl == null || hlsUrl.isEmpty()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("HLS conversion failed");
            }

            Video video = new Video();
            video.setVideoTitle(request.title());
            video.setVideoUrl(hlsUrl);
            video.setCloudinaryPublicId(request.publicId());
            video.setDurationInSeconds(0);
            video.setChapter(chapter);

            Video savedVideo = videoService.saveVideo(video);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Video saved successfully");
            response.put("videoId", savedVideo.getVideoId());
            response.put("url", savedVideo.getVideoUrl());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Video save error", e);

            Map<String, Object> error = new HashMap<>();
            error.put("error", "Save failed: " + e.getMessage());
            error.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/delete-video/{videoId}")
    public ResponseEntity<?> deleteVideo(@PathVariable int videoId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Video video = videoService.getVideoById(videoId);
        if (video == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        Chapter chapter = video.getChapter();
        if (chapter == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        
        Module module = chapter.getModule();
        if (module == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        
        Course course = module.getCourse();
        if (course == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        if (course.getInstructor() == null || !course.getInstructor().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Use stored public ID for Cloudinary deletion
        String publicId = video.getCloudinaryPublicId();
        if (publicId != null && !publicId.isEmpty()) {
            try {
                fileUploadService.deleteFile(publicId);
            } catch (Exception e) {
                logger.error("Cloudinary deletion failed for publicId: {}", publicId, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        } else {
            // Fallback: parse public ID from URL for older videos without stored publicId
            String videoUrl = video.getVideoUrl();
            String fallbackPublicId;
            int folderIdx = videoUrl.indexOf("lms_uploads/");
            if (folderIdx != -1) {
                String pathWithExt = videoUrl.substring(folderIdx);
                fallbackPublicId = pathWithExt.substring(0, pathWithExt.lastIndexOf("."));
            } else {
                fallbackPublicId = "lms_uploads/" + videoUrl.substring(videoUrl.lastIndexOf("/") + 1, videoUrl.lastIndexOf("."));
            }
            try {
                fileUploadService.deleteFile(fallbackPublicId);
            } catch (Exception e) {
                logger.error("Cloudinary deletion failed for fallback publicId: {}", fallbackPublicId, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        }

        try {
            videoService.deleteVideo(videoId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/create-course")
    public ResponseEntity<?> createCourse(@RequestBody CourseRequest request) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Course course = new Course();
        course.setCourseName(request.courseName());
        course.setCourseDescription(request.courseDescription());
        course.setCourseDuration(request.courseDuration());
        course.setCoursePrice(request.coursePrice());
        course.setCourseImage(request.courseImage());
        course.setCourseStatus(request.courseStatus());
        course.setCourseCreatedAt(OffsetDateTime.now().toString());
        course.setCourseUpdatedAt(OffsetDateTime.now().toString());

        course.setInstructor(user);
        course.setUser(user);
        Course created = courseService.createCourse(course);

        return ResponseEntity.status(HttpStatus.CREATED).body(DtoMapper.toCourseResponse(created));
    }

    
    @DeleteMapping("/delete-course/{courseId}")
    public ResponseEntity<?> deleteCourse(@PathVariable int courseId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Course existing = courseService.getCourseById(courseId);

        if (existing == null ||
            existing.getInstructor() == null ||
            !existing.getInstructor().getId().equals(user.getId())) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        courseService.deleteCourse(courseId);
        return ResponseEntity.noContent().build();
    }

    
    @PutMapping("/update-course/{courseId}")
    public ResponseEntity<?> updateCourse(
            @PathVariable int courseId,
            @RequestBody CourseRequest incoming) {

        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Course existing = courseService.getCourseById(courseId);

        if (existing == null ||
            existing.getInstructor() == null ||
            !existing.getInstructor().getId().equals(user.getId())) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

    
        existing.setCourseName(incoming.courseName());
        existing.setCourseDescription(incoming.courseDescription());
        existing.setCourseDuration(incoming.courseDuration());
        existing.setCoursePrice(incoming.coursePrice());
        existing.setCourseImage(incoming.courseImage());
        existing.setCourseStatus(incoming.courseStatus());
        existing.setCourseUpdatedAt(OffsetDateTime.now().toString());

        Course updated = courseService.updateCourse(existing);

        return ResponseEntity.ok(DtoMapper.toCourseResponse(updated));
    }
}