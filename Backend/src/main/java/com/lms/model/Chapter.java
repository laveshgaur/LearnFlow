package com.lms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;


@Entity
@Table(name = "chapters")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Chapter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int chapterId;
    @Column(name = "chapter_name", nullable = false)
    private String chapterName;
    
    @Lob
    @Column(name = "chapter_description", nullable = false, columnDefinition = "TEXT")
    private String chapterDescription;
    @Column(name = "chapter_duration", nullable = false)
    private int durationInSeconds;
    
    private LocalDateTime chapterCreatedAt;
    private LocalDateTime chapterUpdatedAt;
    @ManyToOne
    @JoinColumn(name = "module_id", nullable = false)
    @JsonBackReference
    private Module module;
}
