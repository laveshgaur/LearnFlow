package com.lms.service;

import com.lms.model.*;
import com.lms.repository.QuizAttemptRepository;
import com.lms.repository.QuizQuestionRepository;
import com.lms.repository.QuizRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizQuestionRepository questionRepository;

    @Autowired
    private QuizAttemptRepository attemptRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ══════════ Quiz CRUD ══════════

    public Quiz createQuiz(Quiz quiz) {
        quiz.setCreatedAt(LocalDateTime.now());
        return quizRepository.save(quiz);
    }

    public Quiz getQuizById(int quizId) {
        return quizRepository.findById(quizId).orElse(null);
    }

    public Optional<Quiz> getQuizByModuleId(int moduleId) {
        return quizRepository.findByModule_ModuleId(moduleId);
    }

    public boolean hasQuiz(int moduleId) {
        return quizRepository.existsByModule_ModuleId(moduleId);
    }

    public Quiz updateQuiz(Quiz quiz) {
        return quizRepository.save(quiz);
    }

    @Transactional
    public void deleteQuiz(int quizId) {
        quizRepository.deleteById(quizId);
    }

    // ══════════ Question CRUD ══════════

    public QuizQuestion addQuestion(QuizQuestion question) {
        return questionRepository.save(question);
    }

    public List<QuizQuestion> getQuestionsByQuizId(int quizId) {
        return questionRepository.findByQuiz_QuizIdOrderByQuestionOrderAsc(quizId);
    }

    public QuizQuestion updateQuestion(QuizQuestion question) {
        return questionRepository.save(question);
    }

    public void deleteQuestion(int questionId) {
        questionRepository.deleteById(questionId);
    }

    // ══════════ Attempt / Scoring ══════════

    /**
     * Grade and persist a quiz attempt.
     *
     * @param user    the authenticated student
     * @param quiz    the quiz being taken
     * @param answers list of selected option indices (zero-based)
     * @return the persisted QuizAttempt with score, pass/fail, etc.
     */
    @Transactional
    public QuizAttempt submitAttempt(User user, Quiz quiz, List<Integer> answers) {
        List<QuizQuestion> questions = getQuestionsByQuizId(quiz.getQuizId());

        int totalQuestions = questions.size();
        int correctAnswers = 0;

        for (int i = 0; i < totalQuestions; i++) {
            if (i < answers.size() && answers.get(i) == questions.get(i).getCorrectOptionIndex()) {
                correctAnswers++;
            }
        }

        double score = totalQuestions > 0 ? ((double) correctAnswers / totalQuestions) * 100.0 : 0;
        boolean passed = score >= quiz.getPassingScore();

        QuizAttempt attempt = new QuizAttempt();
        attempt.setUser(user);
        attempt.setQuiz(quiz);
        attempt.setScore(Math.round(score * 100.0) / 100.0); // round to 2 decimals
        attempt.setTotalQuestions(totalQuestions);
        attempt.setCorrectAnswers(correctAnswers);
        attempt.setPassed(passed);
        attempt.setAttemptedAt(LocalDateTime.now());

        // Persist answers as JSON
        try {
            attempt.setAnswersJson(objectMapper.writeValueAsString(answers));
        } catch (Exception e) {
            attempt.setAnswersJson(answers.toString());
        }

        return attemptRepository.save(attempt);
    }

    // ══════════ Query helpers ══════════

    /**
     * Has this user ever passed the given quiz?
     */
    public boolean hasUserPassedQuiz(String userId, int quizId) {
        return attemptRepository.existsByUser_IdAndQuiz_QuizIdAndPassedTrue(userId, quizId);
    }

    /**
     * Returns the user's best (highest-score) attempt on a quiz.
     */
    public Optional<QuizAttempt> getBestAttempt(String userId, int quizId) {
        return attemptRepository.findFirstByUser_IdAndQuiz_QuizIdOrderByScoreDesc(userId, quizId);
    }

    /**
     * All attempts for a specific quiz (for instructor results dashboard).
     */
    public List<QuizAttempt> getAttemptsByQuizId(int quizId) {
        return attemptRepository.findByQuiz_QuizIdOrderByAttemptedAtDesc(quizId);
    }

    /**
     * All attempts by a user on a specific quiz, newest first.
     */
    public List<QuizAttempt> getUserAttemptsForQuiz(String userId, int quizId) {
        return attemptRepository.findByUser_IdAndQuiz_QuizIdOrderByAttemptedAtDesc(userId, quizId);
    }

    /**
     * All attempts for quizzes in a specific course.
     */
    public List<QuizAttempt> getAttemptsByCourseId(int courseId) {
        return attemptRepository.findByCourseId(courseId);
    }
}
