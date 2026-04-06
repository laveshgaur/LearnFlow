package com.lms.service;

import com.lms.model.Courses;
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

    @Autowired
    private UserService userService;
    
    public Courses createCourse(Courses course) {
        String now = OffsetDateTime.now().toString();
        if (course.getCourseCreatedAt() == null || course.getCourseCreatedAt().isBlank()) {
            course.setCourseCreatedAt(now);
        }
        if (course.getCourseUpdatedAt() == null || course.getCourseUpdatedAt().isBlank()) {
            course.setCourseUpdatedAt(now);
        }
        return courseRepository.save(course);
    }
    public List<Courses> getCoursesByUserId(String userId) {
        return courseRepository.findByUser_Id(userId);
    }
    public List<Courses> getAllCourses(){
        return courseRepository.findAll();
    }
    public Courses getCourseById(int courseId){
        return courseRepository.findById(courseId).orElse(null);
    }
    public Courses updateCourse(Courses course){
        return courseRepository.save(course);
    }
    public void deleteCourse(int courseId){
        courseRepository.deleteById(courseId);
    }
    public void purchaseCourse(int courseId, User user){
        Courses course = getCourseById(courseId);
        if(course == null){
            throw new RuntimeException("Course not found");
        }
        user.getCourses().add(course);
        course.setUser(user);
        userRepository.save(user);
        courseRepository.save(course);
    }
}
