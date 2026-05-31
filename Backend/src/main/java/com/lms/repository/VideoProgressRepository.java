package com.lms.repository;

import com.lms.model.VideoProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VideoProgressRepository extends JpaRepository<VideoProgress, Long> {

    Optional<VideoProgress> findByUser_IdAndVideo_VideoId(String userId, int videoId);

    List<VideoProgress> findByUser_IdAndVideo_Chapter_ChapterId(String userId, int chapterId);
}
