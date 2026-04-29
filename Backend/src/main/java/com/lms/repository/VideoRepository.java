package com.lms.repository;

import com.lms.model.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VideoRepository extends JpaRepository<Video, Integer> {

    List<Video> findByChapterChapterId(int chapterId);
}