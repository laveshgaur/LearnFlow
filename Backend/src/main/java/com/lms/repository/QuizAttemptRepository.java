package com.lms.repository;

import com.lms.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByUser_IdAndQuiz_QuizIdOrderByAttemptedAtDesc(String userId, int quizId);

    /** Best (highest score) attempt by a user on a quiz. */
    Optional<QuizAttempt> findFirstByUser_IdAndQuiz_QuizIdOrderByScoreDesc(String userId, int quizId);

    /** Has the user passed this quiz at least once? */
    boolean existsByUser_IdAndQuiz_QuizIdAndPassedTrue(String userId, int quizId);

    /** All attempts for a specific quiz (for instructor results view). */
    @Query("SELECT a FROM QuizAttempt a WHERE a.quiz.module.course.courseId = :courseId ORDER BY a.attemptedAt DESC")
    List<QuizAttempt> findByCourseId(@Param("courseId") int courseId);

    List<QuizAttempt> findByQuiz_QuizIdOrderByAttemptedAtDesc(int quizId);
}
