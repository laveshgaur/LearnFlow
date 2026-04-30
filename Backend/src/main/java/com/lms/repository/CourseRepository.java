package com.lms.repository;

import com.lms.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Integer> {
    Course findByCourseName(String courseName);
    Course findByCourseId(int courseId);
    Course findByCourseDescription(String courseDescription);
    Course findByCourseDuration(String courseDuration);
    Course findByCoursePrice(String coursePrice);
    Course findByCourseImage(String courseImage);
    List<Course> findByCourseStatus(String courseStatus);
    Course findByCourseCreatedAt(String courseCreatedAt);
    Course findByCourseUpdatedAt(String courseUpdatedAt);
    List<Course> findByInstructor_Id(String instructorId);
    List<Course> findByUser_Id(String userId);

    Course findByCourseIdAndInstructor_Id(int courseId, String instructorId);
    Course findByCourseIdAndUser_Id(int courseId, String userId);
}
