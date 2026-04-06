package com.lms.repository;

import com.lms.model.Courses;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Courses, Integer> {
    Courses findByCourseName(String courseName);
    Courses findByCourseId(int courseId);
    Courses findByCourseDescription(String courseDescription);
    Courses findByCourseDuration(String courseDuration);
    Courses findByCoursePrice(String coursePrice);
    Courses findByCourseImage(String courseImage);
    Courses findByCourseStatus(String courseStatus);
    Courses findByCourseCreatedAt(String courseCreatedAt);
    Courses findByCourseUpdatedAt(String courseUpdatedAt);
    List<Courses> findByUser_Id(String userId);

    Courses findByCourseIdAndUser_Id(int courseId, String userId);
}
