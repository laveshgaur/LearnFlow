package com.lms.dto.response;

public record ChapterResponse(
        int chapterId,
        String chapterName,
        String chapterDescription,
        int durationInSeconds
) {}
