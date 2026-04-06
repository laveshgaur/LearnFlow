package com.lms.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "courses")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Courses {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int courseId;
    @Column(name = "course_name", nullable = false)
    private String courseName;
    @Column(name = "course_description", nullable = false)
    private String courseDescription;
    @Column(name = "course_duration", nullable = false)
    private String courseDuration;
    @Column(name = "course_price", nullable = false)
    private String coursePrice;
    @Column(name = "course_image", nullable = false)
    private String courseImage;
    @Column(name = "course_status", nullable = false)
    private String courseStatus;
    @Column(name = "course_created_at", nullable = false)
    private String courseCreatedAt;
    @Column(name = "course_updated_at", nullable = false)
    private String courseUpdatedAt;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;
}
