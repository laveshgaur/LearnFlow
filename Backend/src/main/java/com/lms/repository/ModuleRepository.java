package com.lms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.lms.model.Module;

public interface ModuleRepository extends JpaRepository<Module, Integer> {
    List<Module> findByCourse_CourseId(int courseId);

}