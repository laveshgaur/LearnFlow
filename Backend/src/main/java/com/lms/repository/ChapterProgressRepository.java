package com.lms.repository;

import com.lms.model.ChapterProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChapterProgressRepository extends JpaRepository<ChapterProgress, Long> {

    Optional<ChapterProgress> findByUser_IdAndChapter_ChapterId(String userId, int chapterId);

    List<ChapterProgress> findByUser_IdAndCompletedTrue(String userId);

    @Query("SELECT cp FROM ChapterProgress cp " +
           "WHERE cp.user.id = :userId " +
           "AND cp.chapter.module.course.courseId = :courseId")
    List<ChapterProgress> findByUserAndCourse(@Param("userId") String userId,
                                               @Param("courseId") int courseId);

    @Query("SELECT COUNT(cp) FROM ChapterProgress cp " +
           "WHERE cp.chapter.module.course.courseId = :courseId " +
           "AND cp.completed = true")
    long countCompletedByCourse(@Param("courseId") int courseId);

    @Query("SELECT COUNT(DISTINCT cp.user.id) FROM ChapterProgress cp " +
           "WHERE cp.chapter.module.course.courseId = :courseId " +
           "AND cp.completed = true")
    long countDistinctUsersWithProgressByCourse(@Param("courseId") int courseId);
}
