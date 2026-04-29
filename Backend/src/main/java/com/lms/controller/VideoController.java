package com.lms.controller;

import com.lms.model.Module;
import com.lms.model.User;
import com.lms.model.Video;
import com.lms.service.ModuleService;
import com.lms.service.UserService;
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

@RestController
@RequestMapping("/courses/{courseId}/modules/{moduleId}/chapters/{chapterId}/videos")
public class VideoController {
    
    @Autowired
    private VideoService videoService;

    @Autowired
    private UserService userService;

    @Autowired
    private ModuleService moduleService;

    private boolean isOwner(User user, Module module) {
        return module.getCourse().getUser().getId() == user.getId();
    }
    @GetMapping
    public ResponseEntity<List<Video>> listVideos(
            @PathVariable int courseId,
            @PathVariable int moduleId,
            @PathVariable int chapterId) {
        Module module = moduleService.getModuleById(moduleId);
        if (module == null || module.getCourse().getCourseId() != courseId) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        List<Video> videos = videoService.getVideosByChapterId(chapterId);
        return ResponseEntity.ok(videos);
    }
}
