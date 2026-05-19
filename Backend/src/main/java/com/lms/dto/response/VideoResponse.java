package com.lms.dto.response;

public record VideoResponse(
        int videoId,
        String videoTitle,
        String videoUrl,
        int durationInSeconds
) {}
