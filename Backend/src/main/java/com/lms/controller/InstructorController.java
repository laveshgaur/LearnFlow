package com.lms.controller;

import com.lms.model.Courses;
import com.lms.model.User;
import com.lms.service.CourseService;
import com.lms.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/instructor")
public class InstructorController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserService userService;
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
        List<Courses> courses = courseService.getCoursesByUserId(user.getId());
        return new ResponseEntity<>(courses, HttpStatus.OK);
    }
    @PostMapping("/create-course")
    public ResponseEntity<?> createCourse(@RequestBody Courses course) {
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
        Courses existing = courseService.getCourseById(courseId);
        if (existing == null || existing.getUser() == null || !existing.getUser().getId().equals(user.getId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        courseService.deleteCourse(courseId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/update-course/{courseId}")
    public ResponseEntity<?> updateCourse(@PathVariable int courseId, @RequestBody Courses incoming) {
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
        Courses existing = courseService.getCourseById(courseId);
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
