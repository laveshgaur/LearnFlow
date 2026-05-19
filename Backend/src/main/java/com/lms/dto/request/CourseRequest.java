package com.lms.dto.request;

public record CourseRequest(
        String courseName,
        String courseDescription,
        String courseDuration,
        String coursePrice,
        String courseImage,
        String courseStatus
) {}
