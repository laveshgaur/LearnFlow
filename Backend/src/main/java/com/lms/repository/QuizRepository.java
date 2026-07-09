package com.lms.repository;

import com.lms.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QuizRepository extends JpaRepository<Quiz, Integer> {
    Optional<Quiz> findByModule_ModuleId(int moduleId);
    boolean existsByModule_ModuleId(int moduleId);
}
