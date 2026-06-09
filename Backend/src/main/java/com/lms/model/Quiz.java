package com.lms.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "quizzes")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int quizId;

    @Column(name = "quiz_title", nullable = false)
    private String quizTitle;

    @Column(name = "quiz_description")
    private String quizDescription;

    /** Minimum score (0–100) to pass and unlock next module. */
    @Column(name = "passing_score", nullable = false)
    private int passingScore = 70;

    /** Duration limit in minutes. 0 = no time limit. */
    @Column(name = "time_limit_minutes", nullable = false)
    private int timeLimitMinutes = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToOne
    @JoinColumn(name = "module_id", nullable = false, unique = true)
    @JsonBackReference(value = "module-quiz")
    private Module module;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference(value = "quiz-questions")
    @OrderBy("questionOrder ASC")
    private List<QuizQuestion> questions;
}
