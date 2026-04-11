package com.lms.repository;

import com.lms.model.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChapterRepository extends JpaRepository<Chapter, Integer> {
    List<Chapter> findByModule_ModuleId(int moduleId);
    
}
