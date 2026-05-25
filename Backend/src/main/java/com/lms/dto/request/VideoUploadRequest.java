package com.lms.dto.request;

public record VideoUploadRequest(
        int chapterId,
        String title,
        String publicId,
        String videoUrl
) {}
