package com.lms.dto.response;

public record CourseResponse(
        int courseId,
        String courseName,
        String courseDescription,
        String courseDuration,
        String coursePrice,
        String courseImage,
        String courseStatus,
        String instructorName
) {}
