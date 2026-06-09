package com.lms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempts")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class QuizAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long attemptId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    /** Score achieved (0–100). */
    @Column(name = "score", nullable = false)
    private double score;

    /** Total questions in the quiz at time of attempt. */
    @Column(name = "total_questions", nullable = false)
    private int totalQuestions;

    /** Number of correct answers. */
    @Column(name = "correct_answers", nullable = false)
    private int correctAnswers;

    /** Whether the attempt met the passing score. */
    @Column(name = "passed", nullable = false)
    private boolean passed;

    /** JSON string of user's answers, e.g. "[0,2,1,3]" (indices). */
    @Column(name = "answers_json", columnDefinition = "TEXT")
    private String answersJson;

    @Column(name = "attempted_at")
    private LocalDateTime attemptedAt;
}
