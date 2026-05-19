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
import java.util.stream.Collectors;
import com.lms.dto.request.ModuleRequest;
import com.lms.dto.response.ModuleResponse;
import com.lms.dto.mapper.DtoMapper;

@RestController
@RequestMapping("course/{courseId}/modules")
public class ModuleController {

    @Autowired
    private ModuleService moduleService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserService userService;

    // -------------------- HELPERS --------------------

    private boolean isInstructor(User user) {
        return user != null
                && user.getRoles() != null
                && user.getRoles().contains("INSTRUCTOR");
    }

    
    private User resolveOwner(Authentication authentication, int courseId) {
        if (authentication == null || !authentication.isAuthenticated()) return null;
        User user = userService.getUserByUsername(authentication.getName());
        if (!isInstructor(user)) return null;
        Course course = courseService.getCourseById(courseId);
        if (course == null) return null;
        String ownerId = course.getInstructor() != null
                ? course.getInstructor().getId()
                : (course.getUser() != null ? course.getUser().getId() : null);
        if (ownerId == null || !ownerId.equals(user.getId())) return null;
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
