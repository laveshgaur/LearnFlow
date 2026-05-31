package com.lms.service;

import com.lms.model.User;
import com.lms.model.Video;
import com.lms.model.VideoProgress;
import com.lms.repository.VideoProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class VideoProgressService {

    @Autowired
    private VideoProgressRepository repository;

    /**
     * Upsert video watch progress. Only allows watchPercent to increase (no regression).
     */
    public VideoProgress saveProgress(User user, Video video, double watchPercent, double lastPosition) {
        Optional<VideoProgress> existing = repository.findByUser_IdAndVideo_VideoId(user.getId(), video.getVideoId());

        if (existing.isPresent()) {
            VideoProgress vp = existing.get();
            // Only allow percent to increase
            if (watchPercent > vp.getWatchPercent()) {
                vp.setWatchPercent(watchPercent);
            }
            vp.setLastPosition(lastPosition);
            vp.setUpdatedAt(LocalDateTime.now());
            return repository.save(vp);
        }

        VideoProgress vp = new VideoProgress();
        vp.setUser(user);
        vp.setVideo(video);
        vp.setWatchPercent(Math.max(0, watchPercent));
        vp.setLastPosition(lastPosition);
        vp.setUpdatedAt(LocalDateTime.now());
        return repository.save(vp);
    }

    /**
     * Get all video progress records for a user in a specific chapter.
     */
    public List<VideoProgress> getProgressForChapter(String userId, int chapterId) {
        return repository.findByUser_IdAndVideo_Chapter_ChapterId(userId, chapterId);
    }

    /**
     * Check if all videos in a chapter are watched >= threshold%.
     */
    public boolean areAllVideosWatched(String userId, int chapterId, List<Video> chapterVideos, double threshold) {
        if (chapterVideos == null || chapterVideos.isEmpty()) {
            return true; // No videos means nothing to watch
        }
        List<VideoProgress> progress = getProgressForChapter(userId, chapterId);
        for (Video v : chapterVideos) {
            boolean found = false;
            for (VideoProgress vp : progress) {
                if (vp.getVideo().getVideoId() == v.getVideoId() && vp.getWatchPercent() >= threshold) {
                    found = true;
                    break;
                }
            }
            if (!found) return false;
        }
        return true;
    }
}
