package com.lms.controller;

import com.lms.model.Course;
import com.lms.model.User;
import com.lms.service.CourseService;
import com.lms.service.ModuleService;
import com.lms.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.lms.model.Module;
import java.util.List;
import java.time.LocalDateTime;
import java.util.stream.Collectors;
import com.lms.dto.request.ModuleRequest;
import com.lms.dto.response.ModuleResponse;
import com.lms.dto.mapper.DtoMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("course/{courseId}/modules")
public class ModuleController {

    private static final Logger logger = LoggerFactory.getLogger(ModuleController.class);

    @Autowired
    private ModuleService moduleService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserService userService;

    // -------------------- HELPERS --------------------

    private boolean isInstructorOrAdmin(User user) {
        return user != null
                && user.getRoles() != null
                && (user.getRoles().contains("INSTRUCTOR") || user.getRoles().contains("ADMIN"));
    }

    
    private User resolveOwner(Authentication authentication, int courseId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Module access denied: no authentication");
            return null;
        }
        User user = userService.getUserByUsername(authentication.getName());
        if (!isInstructorOrAdmin(user)) {
            logger.warn("Module access denied: user '{}' lacks INSTRUCTOR or ADMIN role", authentication.getName());
            return null;
        }
        Course course = courseService.getCourseById(courseId);
        if (course == null) {
            logger.warn("Module access denied: course {} not found", courseId);
            return null;
        }

        // ADMIN users can manage any course
        if (user.getRoles().contains("ADMIN")) {
            return user;
        }

        String ownerId = course.getInstructor() != null
                ? course.getInstructor().getId()
                : (course.getUser() != null ? course.getUser().getId() : null);
        if (ownerId == null || !ownerId.equals(user.getId())) {
            logger.warn("Module access denied: user '{}' does not own course {}", authentication.getName(), courseId);
            return null;
        }
        return user;
    }

    // -------------------- ENDPOINTS --------------------

    @GetMapping
    public ResponseEntity<?> getModules(@PathVariable int courseId) {
        List<Module> modules = moduleService.getModulesByCourseId(courseId);
        if (modules == null || modules.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        List<ModuleResponse> responses = modules.stream()
                .map(DtoMapper::toModuleResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    public ResponseEntity<?> createModule(
            @PathVariable int courseId,
            @RequestBody ModuleRequest request,
            Authentication authentication) {

        if (resolveOwner(authentication, courseId) == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Module module = new Module();
        module.setModuleName(request.moduleName());
        module.setModuleDescription(request.moduleDescription());
        module.setModuleDuration(request.moduleDuration());
        module.setModulePrice(request.modulePrice());
        module.setModuleImage(request.moduleImage());
        module.setModuleStatus(request.moduleStatus());
        module.setCourse(courseService.getCourseById(courseId));
        String now = LocalDateTime.now().toString();
        module.setModuleCreatedAt(now);
        module.setModuleUpdatedAt(now);
        Module created = moduleService.createModule(module);
        return ResponseEntity.status(HttpStatus.CREATED).body(DtoMapper.toModuleResponse(created));
    }

    @PutMapping("/{moduleId}")
    public ResponseEntity<?> updateModule(
            @PathVariable int courseId,
            @PathVariable int moduleId,
            @RequestBody ModuleRequest request,
            Authentication authentication) {

        if (resolveOwner(authentication, courseId) == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Module module = new Module();
        module.setModuleName(request.moduleName());
        module.setModuleDescription(request.moduleDescription());
        module.setModuleDuration(request.moduleDuration());
        module.setModulePrice(request.modulePrice());
        module.setModuleImage(request.moduleImage());
        module.setModuleStatus(request.moduleStatus());
        module.setCourse(courseService.getCourseById(courseId));
        module.setModuleId(moduleId);
        module.setModuleUpdatedAt(LocalDateTime.now().toString());
        Module updated = moduleService.updateModule(module);
        return ResponseEntity.ok(DtoMapper.toModuleResponse(updated));
    }

    @DeleteMapping("/{moduleId}")
    public ResponseEntity<?> deleteModule(
            @PathVariable int courseId,
            @PathVariable int moduleId,
            Authentication authentication) {

        if (resolveOwner(authentication, courseId) == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        moduleService.deleteModule(moduleId);
        return ResponseEntity.noContent().build();
    }
}
