package com.lms.controller;


import com.lms.service.CourseService;
import com.lms.service.ModuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.lms.model.Module;
import java.util.List;

@RestController
@RequestMapping("course/{courseId}/modules")
public class ModuleController {
    @Autowired
    private ModuleService moduleService;
    @Autowired
    private CourseService courseService;
    @GetMapping
    public ResponseEntity<List<Module>> getModules(@PathVariable int courseId) {
        List<Module> modules = moduleService.getModulesByCourseId(courseId);
        if(modules == null || modules.isEmpty()){
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ResponseEntity.ok(modules);
    }
    @PostMapping
    public ResponseEntity<Module> createModule(@PathVariable int courseId, @RequestBody Module module) {
        module.setCourse(courseService.getCourseById(courseId));
        return ResponseEntity.ok(moduleService.createModule(module));
    }

    @PutMapping
    public ResponseEntity<Module> updateModule(@PathVariable int courseId, @RequestBody Module module) {
        module.setCourse(courseService.getCourseById(courseId));
        return ResponseEntity.ok(moduleService.updateModule(module));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteModules(@PathVariable int moduleId) {
        moduleService.deleteModule(moduleId);
        return ResponseEntity.noContent().build();
    }
}
