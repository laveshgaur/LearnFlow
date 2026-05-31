package com.lms.service;

import com.lms.model.Chapter;
import com.lms.model.ChapterProgress;
import com.lms.model.User;
import com.lms.repository.ChapterProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ChapterProgressService {

    @Autowired
    private ChapterProgressRepository progressRepository;

    /**
     * Get existing progress or create a new (incomplete) record.
     */
    public ChapterProgress getOrCreate(User user, Chapter chapter) {
        Optional<ChapterProgress> existing =
                progressRepository.findByUser_IdAndChapter_ChapterId(user.getId(), chapter.getChapterId());
        if (existing.isPresent()) return existing.get();

        ChapterProgress cp = new ChapterProgress();
        cp.setUser(user);
        cp.setChapter(chapter);
        cp.setCompleted(false);
        cp.setTimeSpentSeconds(0);
        return progressRepository.save(cp);
    }

    /**
     * Explicitly mark a chapter as complete.
     */
    public ChapterProgress markComplete(User user, Chapter chapter) {
        ChapterProgress cp = getOrCreate(user, chapter);
        if (!cp.isCompleted()) {
            cp.setCompleted(true);
            cp.setCompletedAt(LocalDateTime.now());
            return progressRepository.save(cp);
        }
        return cp;
    }

    /**
     * Save/update an existing ChapterProgress record.
     */
    public ChapterProgress save(ChapterProgress cp) {
        return progressRepository.save(cp);
    }

    public List<ChapterProgress> getProgressForCourse(String userId, int courseId) {
        return progressRepository.findByUserAndCourse(userId, courseId);
    }

    public long countCompletedByCourse(int courseId) {
        return progressRepository.countCompletedByCourse(courseId);
    }

    public long countUsersWithProgress(int courseId) {
        return progressRepository.countDistinctUsersWithProgressByCourse(courseId);
    }
}
