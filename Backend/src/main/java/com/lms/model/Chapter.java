package com.lms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
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
    @Column(name = "chapter_description", nullable = false)
    private String chapterDescription;
    @Column(name = "chapter_duration", nullable = false)
    private String chapterDuration;
    @Column(name = "chapter_price", nullable = false)
    private String chapterPrice;
    @Column(name = "chapter_image", nullable = false)
    private String chapterImage;
    private String chapterCreatedAt;
    private String chapterUpdatedAt;
    @ManyToOne
    @JoinColumn(name = "module_id", nullable = false)
    @JsonBackReference
    private Module module;
}
