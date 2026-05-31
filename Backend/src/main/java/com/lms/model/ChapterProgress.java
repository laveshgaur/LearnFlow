package com.lms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "chapter_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "chapter_id"})
})
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ChapterProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;

    @Column(name = "completed", nullable = false)
    private boolean completed = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    /** Cumulative seconds the user has spent on this chapter. */
    @Column(name = "time_spent_seconds", nullable = false)
    private int timeSpentSeconds = 0;
}
