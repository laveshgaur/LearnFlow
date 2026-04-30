package com.lms.service;

import com.lms.model.Course;
import com.lms.model.User;
import com.lms.repository.CourseRepository;
import com.lms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.OffsetDateTime;
import java.util.List;

@Service
public class CourseService {
    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    
    public Course createCourse(Course course) {
        String now = OffsetDateTime.now().toString();
        if (course.getCourseCreatedAt() == null || course.getCourseCreatedAt().isBlank()) {
            course.setCourseCreatedAt(now);
        }
        if (course.getCourseUpdatedAt() == null || course.getCourseUpdatedAt().isBlank()) {
            course.setCourseUpdatedAt(now);
        }
        return courseRepository.save(course);
    }
    public List<Course> getCoursesByUserId(String userId) {
        return courseRepository.findByInstructor_Id(userId);
    }
    public List<Course> getAllCourses(){
        return courseRepository.findAll();
    }
    public List<Course> getPublishedCourses(){
        return courseRepository.findByCourseStatus("PUBLISHED");
    }
    public Course getCourseById(int courseId){
        return courseRepository.findById(courseId).orElse(null);
    }
    public Course updateCourse(Course course){
        return courseRepository.save(course);
    }
    public void deleteCourse(int courseId){
        courseRepository.deleteById(courseId);
    }
    public void purchaseCourse(int courseId, User user){
        Course course = getCourseById(courseId);
        if(course == null){
            throw new RuntimeException("Course not found");
        }
        user.getCourses().add(course);
        course.setUser(user);
        userRepository.save(user);
        courseRepository.save(course);
    }
}
