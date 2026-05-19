package com.lms.controller;

import com.lms.model.Module;
import com.lms.model.Video;
import com.lms.service.ModuleService;
import com.lms.service.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;
import com.lms.dto.response.VideoResponse;
import com.lms.dto.mapper.DtoMapper;

@RestController
@RequestMapping("/courses/{courseId}/modules/{moduleId}/chapters/{chapterId}/videos")
public class VideoController {
    
    @Autowired
    private VideoService videoService;

    @Autowired
    private ModuleService moduleService;

    @GetMapping
    public ResponseEntity<?> listVideos(
            @PathVariable int courseId,
            @PathVariable int moduleId,
            @PathVariable int chapterId) {

        Module module = moduleService.getModuleById(moduleId);
        if (module == null || module.getCourse().getCourseId() != courseId) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String username = authentication.getName();
        if (username == null || username.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Any authenticated user can view videos (learners + instructors)
        List<Video> videos = videoService.getVideosByChapterId(chapterId);
        List<VideoResponse> responses = videos.stream()
                .map(DtoMapper::toVideoResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
}
