package com.lms.service;

import com.lms.repository.ModuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import com.lms.model.Module;

@Service
public class ModuleService {
    @Autowired
    private ModuleRepository moduleRepository;
    
    public List<Module> getModulesByCourseId(int courseId) {
        return moduleRepository.findByCourse_CourseId(courseId);
    }
    public Module createModule(Module module) {
        return moduleRepository.save(module);
    }
    public Module getModuleById(int moduleId) {
        return moduleRepository.findById(moduleId).orElse(null);
    }
    public Module updateModule(Module module) {
        return moduleRepository.save(module);
    }
    public void deleteModule(int moduleId) {
        moduleRepository.deleteById(moduleId);
    }
}