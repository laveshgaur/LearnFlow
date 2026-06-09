package com.lms.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "quiz_questions")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class QuizQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int questionId;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    /** Comma-separated options, e.g. "React|Angular|Vue|Svelte" (pipe-separated). */
    @Column(name = "options", nullable = false, columnDefinition = "TEXT")
    private String options;

    /** Zero-based index of the correct option. */
    @Column(name = "correct_option_index", nullable = false)
    private int correctOptionIndex;

    @Column(name = "question_order", nullable = false)
    private int questionOrder = 0;

    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    @JsonBackReference(value = "quiz-questions")
    private Quiz quiz;
}
