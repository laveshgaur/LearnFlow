package com.lms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "video_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "video_id"})
})
@AllArgsConstructor
@NoArgsConstructor
@Data
public class VideoProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    /** Percentage of video watched (0–100). */
    @Column(name = "watch_percent", nullable = false)
    private double watchPercent = 0;

    /** Last known playback position in seconds. */
    @Column(name = "last_position", nullable = false)
    private double lastPosition = 0;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
