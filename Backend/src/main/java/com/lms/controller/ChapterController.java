package com.lms.controller;

import com.lms.model.Chapter;
import com.lms.model.Module;
import com.lms.model.User;
import com.lms.service.ChapterService;
import com.lms.service.ModuleService;
import com.lms.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import com.lms.dto.request.ChapterRequest;
import com.lms.dto.response.ChapterResponse;
import com.lms.dto.mapper.DtoMapper;

@RestController
@RequestMapping("/courses/{courseId}/modules/{moduleId}/chapters")
public class ChapterController {

    @Autowired
    private ChapterService chapterService;

    @Autowired
    private ModuleService moduleService;

    @Autowired
    private UserService userService;

    // -------------------- HELPER METHODS --------------------

    private boolean isInstructor(User user) {
        return user != null
                && user.getRoles() != null
                && user.getRoles().contains("INSTRUCTOR");
    }

    private boolean isOwner(User user, Module module) {
        return module != null
                && module.getCourse() != null
                && module.getCourse().getUser() != null
                && module.getCourse().getUser().getId().equals(user.getId());
    }

    private boolean isModuleValid(Module module, int courseId) {
        return module != null
                && module.getCourse() != null
                && module.getCourse().getCourseId() == courseId;
    }

    // -------------------- GET ALL CHAPTERS --------------------

    @GetMapping
    public ResponseEntity<?> getChapters(
            @PathVariable int courseId,
            @PathVariable int moduleId) {

        Module module = moduleService.getModuleById(moduleId);

        if (!isModuleValid(module, courseId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        List<Chapter> chapters = chapterService.getChaptersByModuleId(moduleId);
        List<ChapterResponse> responses = chapters.stream()
                .map(DtoMapper::toChapterResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    // -------------------- CREATE CHAPTER --------------------

    @PostMapping
    public ResponseEntity<?> createChapter(
            @PathVariable int courseId,
            @PathVariable int moduleId,
            @RequestBody ChapterRequest request,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userService.getUserByUsername(authentication.getName());

        if (!isInstructor(user)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Module module = moduleService.getModuleById(moduleId);

        if (!isModuleValid(module, courseId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        if (!isOwner(user, module)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Chapter chapter = new Chapter();
        chapter.setChapterName(request.chapterName());
        chapter.setChapterDescription(request.chapterDescription());
        chapter.setModule(module);

        Chapter created = chapterService.createChapter(chapter);

        return ResponseEntity.status(HttpStatus.CREATED).body(DtoMapper.toChapterResponse(created));
    }



    @PutMapping("/{chapterId}")
    public ResponseEntity<?> updateChapter(
            @PathVariable int courseId,
            @PathVariable int moduleId,
            @PathVariable int chapterId,
            @RequestBody ChapterRequest request,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userService.getUserByUsername(authentication.getName());

        if (!isInstructor(user)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Module module = moduleService.getModuleById(moduleId);

        if (!isModuleValid(module, courseId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        if (!isOwner(user, module)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Chapter existing = chapterService.getChapterById(chapterId);

        if (existing == null || existing.getModule() == null
                || existing.getModule().getModuleId() != moduleId) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        existing.setChapterName(request.chapterName());
        existing.setChapterDescription(request.chapterDescription());
        existing.setChapterId(chapterId);
        existing.setModule(module);

        Chapter updated = chapterService.updateChapter(existing);

        return ResponseEntity.ok(DtoMapper.toChapterResponse(updated));
    }


    @DeleteMapping("/{chapterId}")
    public ResponseEntity<?> deleteChapter(
            @PathVariable int courseId,
            @PathVariable int moduleId,
            @PathVariable int chapterId,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userService.getUserByUsername(authentication.getName());

        if (!isInstructor(user)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Module module = moduleService.getModuleById(moduleId);

        if (!isModuleValid(module, courseId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        if (!isOwner(user, module)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Chapter existing = chapterService.getChapterById(chapterId);

        if (existing == null || existing.getModule() == null
                || existing.getModule().getModuleId() != moduleId) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        chapterService.deleteChapter(chapterId);

        return ResponseEntity.noContent().build();
    }
}