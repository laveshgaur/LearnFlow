package com.lms.controller;

import com.lms.model.Chapter;
import com.lms.model.Module;
import com.lms.model.User;
import com.lms.service.ChapterService;
import com.lms.service.ModuleService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses/{courseId}/modules/{moduleId}/chapters")
public class ChapterController {

    @Autowired
    private ChapterService chapterService;

    @Autowired
    private ModuleService moduleService;

    // -------------------- HELPER METHODS --------------------

    private boolean isInstructor(User user) {
        return user != null
                && user.getRoles() != null
                && user.getRoles().contains("INSTRUCTOR");
    }

    private boolean isOwner(User user, Module module) {
        return module != null
                && module.getCourse() != null
                && module.getCourse().getInstructor() != null
                && module.getCourse().getInstructor().getId().equals(user.getId());
    }

    private boolean isModuleValid(Module module, int courseId) {
        return module != null
                && module.getCourse() != null
                && module.getCourse().getCourseId() == courseId;
    }

    // -------------------- GET ALL CHAPTERS --------------------

    @GetMapping
    public ResponseEntity<List<Chapter>> listChapters(
            @PathVariable int courseId,
            @PathVariable int moduleId) {

        Module module = moduleService.getModuleById(moduleId);

        if (!isModuleValid(module, courseId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        List<Chapter> chapters = chapterService.getChaptersByModuleId(moduleId);

        return ResponseEntity.ok(chapters);
    }

    // -------------------- CREATE CHAPTER --------------------

    @PostMapping
    public ResponseEntity<?> createChapter(
            @PathVariable int courseId,
            @PathVariable int moduleId,
            @RequestBody Chapter chapter,
            @AuthenticationPrincipal User user) {

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

        chapter.setModule(module);

        Chapter created = chapterService.createChapter(chapter);

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }



    @PutMapping("/{chapterId}")
    public ResponseEntity<?> updateChapter(
            @PathVariable int courseId,
            @PathVariable int moduleId,
            @PathVariable int chapterId,
            @RequestBody Chapter chapter,
            @AuthenticationPrincipal User user) {

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

        chapter.setChapterId(chapterId);
        chapter.setModule(module);

        Chapter updated = chapterService.updateChapter(chapter);

        return ResponseEntity.ok(updated);
    }


    @DeleteMapping("/{chapterId}")
    public ResponseEntity<?> deleteChapter(
            @PathVariable int courseId,
            @PathVariable int moduleId,
            @PathVariable int chapterId,
            @AuthenticationPrincipal User user) {

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