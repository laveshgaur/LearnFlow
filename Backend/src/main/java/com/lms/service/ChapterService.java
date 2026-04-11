package com.lms.service;

import com.lms.model.Chapter;
import com.lms.repository.ChapterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChapterService {
    
    @Autowired
    private ChapterRepository chapterRepository;

    public List<Chapter> getChaptersByModuleId(int moduleId) {
        return chapterRepository.findByModule_ModuleId(moduleId);
    }
    public Chapter createChapter(Chapter chapter) {
        return chapterRepository.save(chapter);
    }
    public Chapter getChapterById(int chapterId) {
        return chapterRepository.findById(chapterId).orElse(null);
    }
    public Chapter updateChapter(Chapter chapter) {
        return chapterRepository.save(chapter);
    }
    public void deleteChapter(int chapterId) {
        chapterRepository.deleteById(chapterId);
    }
}
