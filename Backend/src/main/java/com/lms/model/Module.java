package com.lms.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "modules")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Module {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int moduleId;
    @Column(name = "module_name", nullable = false)
    private String moduleName;
    @Column(name = "module_description", nullable = false)
    private String moduleDescription;
    @Column(name = "module_duration", nullable = false)
    private String moduleDuration;
    @Column(name = "module_price", nullable = false)
    private String modulePrice;
    @Column(name = "module_image", nullable = false)
    private String moduleImage;
    @Column(name = "module_status", nullable = false)
    private String moduleStatus;
    @Column(name = "module_created_at", nullable = false)
    private String moduleCreatedAt;
    @Column(name = "module_updated_at", nullable = false)
    private String moduleUpdatedAt;
    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    @JsonBackReference
    private Course course;
    @OneToMany(mappedBy = "module")
    @JsonManagedReference
    private List<Chapter> chapters;
    @ManyToOne
    private User instructor;
}
