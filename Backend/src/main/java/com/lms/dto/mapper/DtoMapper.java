package com.lms.dto.mapper;

import com.lms.dto.response.*;
import com.lms.model.*;
import java.util.List;
import java.util.stream.Collectors;

public class DtoMapper {
    public static UserResponse toUserResponse(User user) {
        if (user == null) return null;
        List<CourseResponse> enrolled = user.getEnrolledCourses() != null 
                ? user.getEnrolledCourses().stream().map(DtoMapper::toCourseResponse).collect(Collectors.toList())
                : null;
        List<CourseResponse> created = user.getCourses() != null
                ? user.getCourses().stream().map(DtoMapper::toCourseResponse).collect(Collectors.toList())
                : null;
                
        return new UserResponse(
                user.getId(),
                user.getUserName(),
                user.getEmail(),
                user.getAge(),
                user.getRoles(),
                enrolled,
                created
        );
    }

    public static VideoResponse toVideoResponse(Video video) {
        if (video == null) return null;
        return new VideoResponse(
                video.getVideoId(),
                video.getVideoTitle(),
                video.getVideoUrl(),
                video.getDurationInSeconds()
        );
    }

    public static ChapterResponse toChapterResponse(Chapter chapter) {
        if (chapter == null) return null;
        return new ChapterResponse(
                chapter.getChapterId(),
                chapter.getChapterName(),
                chapter.getChapterDescription(),
                chapter.getDurationInSeconds()
        );
    }

    public static ModuleResponse toModuleResponse(com.lms.model.Module module) {
        if (module == null) return null;
        return new ModuleResponse(
                module.getModuleId(),
                module.getModuleName(),
                module.getModuleDescription(),
                module.getModuleDuration(),
                module.getModulePrice(),
                module.getModuleImage(),
                module.getModuleStatus()
        );
    }

    public static CourseResponse toCourseResponse(Course course) {
        if (course == null) return null;
        String instructorName = course.getInstructor() != null ? course.getInstructor().getUserName() : null;
        return new CourseResponse(
                course.getCourseId(),
                course.getCourseName(),
                course.getCourseDescription(),
                course.getCourseDuration(),
                course.getCoursePrice(),
                course.getCourseImage(),
                course.getCourseStatus(),
                instructorName
        );
    }
}
