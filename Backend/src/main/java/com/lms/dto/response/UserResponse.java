package com.lms.dto.response;

import java.util.List;

public record UserResponse(
        String id,
        String userName,
        String email,
        int age,
        List<String> roles,
        List<CourseResponse> enrolledCourses,
        List<CourseResponse> courses
) {}
