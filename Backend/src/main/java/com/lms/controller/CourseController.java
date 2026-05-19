package com.lms.controller;

import com.lms.model.Course;
import com.lms.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;
import com.lms.dto.response.CourseResponse;
import com.lms.dto.mapper.DtoMapper;

@RestController
@RequestMapping("/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;
    @GetMapping
    public ResponseEntity<?> listCourses() {
        List<Course> courses = courseService.getPublishedCourses();
        if (courses == null || courses.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        List<CourseResponse> responses = courses.stream()
                .map(DtoMapper::toCourseResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
}
