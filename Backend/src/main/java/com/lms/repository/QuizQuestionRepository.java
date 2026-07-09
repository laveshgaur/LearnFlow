package com.lms.repository;

import com.lms.model.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Integer> {
    List<QuizQuestion> findByQuiz_QuizIdOrderByQuestionOrderAsc(int quizId);
}
