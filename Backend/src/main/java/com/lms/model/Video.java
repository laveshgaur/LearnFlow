package com.lms.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "videos")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private int videoId;    
    @Column(name = "video_title", nullable = false)

    private String videoTitle;
    @Column(name = "video_url", nullable = false)
    private String videoUrl;
    @Column(name = "duration_in_seconds", nullable = false)
    private int durationInSeconds;

    @ManyToOne
    @JoinColumn(name = "chapter_id", nullable = false)
    @JsonBackReference
    private Chapter chapter;
}
