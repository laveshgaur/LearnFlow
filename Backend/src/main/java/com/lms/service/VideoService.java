package com.lms.service;

import com.lms.model.Video;
import com.lms.repository.VideoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VideoService {
    @Autowired
    private VideoRepository videoRepository;

    public List<Video> getVideosByChapterId(int chapterId) {
        return videoRepository.findByChapterChapterId(chapterId);
    }
    
    public Video getVideoById(int videoId) {
        return videoRepository.findById(videoId).orElse(null);
    }

    public Video saveVideo(Video video) {
        return videoRepository.save(video);
    }
    
    public void deleteVideo(int videoId) {
        videoRepository.deleteById(videoId);
    }
    
}
