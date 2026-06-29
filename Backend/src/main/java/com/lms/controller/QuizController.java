package com.lms.controller;

import com.lms.model.*;
import com.lms.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
public class QuizController {

    @Autowired private QuizService quizService;
    @Autowired private ModuleService moduleService;
    @Autowired private CourseService courseService;
    @Autowired private UserService userService;

    private User getAuthUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return userService.getUserByUsername(auth.getName());
    }

    private boolean isInstructorOrAdmin(User u) {
        return u != null && u.getRoles() != null
                && (u.getRoles().contains("INSTRUCTOR") || u.getRoles().contains("ADMIN"));
    }

    // ══════════ Instructor: Quiz CRUD ══════════

    /**
     * GET /instructor/quiz/module/{moduleId}
     * Returns quiz + questions for a module (instructor).
     */
    @GetMapping("/instructor/quiz/module/{moduleId}")
    public ResponseEntity<?> getQuizForModule(@PathVariable int moduleId) {
        User user = getAuthUser();
        if (user == null || !isInstructorOrAdmin(user))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        Optional<Quiz> opt = quizService.getQuizByModuleId(moduleId);
        if (opt.isEmpty()) return ResponseEntity.ok(Map.of("hasQuiz", false));

        Quiz quiz = opt.get();
        return ResponseEntity.ok(buildQuizResponse(quiz, true));
    }

    /**
     * POST /instructor/quiz/module/{moduleId}
     * Create a new quiz for a module.
     * Body: { title, description, passingScore, timeLimitMinutes }
     */
    @PostMapping("/instructor/quiz/module/{moduleId}")
    public ResponseEntity<?> createQuiz(@PathVariable int moduleId, @RequestBody Map<String, Object> body) {
        User user = getAuthUser();
        if (user == null || !isInstructorOrAdmin(user))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        if (quizService.hasQuiz(moduleId))
            return ResponseEntity.badRequest().body("Module already has a quiz");

        com.lms.model.Module module = moduleService.getModuleById(moduleId);
        if (module == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Module not found");

        Quiz quiz = new Quiz();
        quiz.setQuizTitle(str(body.get("title"), "Module Test"));
        quiz.setQuizDescription(str(body.get("description"), ""));
        quiz.setPassingScore(intVal(body.get("passingScore"), 70));
        quiz.setTimeLimitMinutes(intVal(body.get("timeLimitMinutes"), 0));
        quiz.setModule(module);

        Quiz saved = quizService.createQuiz(quiz);
        return ResponseEntity.status(HttpStatus.CREATED).body(buildQuizResponse(saved, true));
    }

    /**
     * PUT /instructor/quiz/{quizId}
     * Update quiz settings.
     */
    @PutMapping("/instructor/quiz/{quizId}")
    public ResponseEntity<?> updateQuiz(@PathVariable int quizId, @RequestBody Map<String, Object> body) {
        User user = getAuthUser();
        if (user == null || !isInstructorOrAdmin(user))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        Quiz quiz = quizService.getQuizById(quizId);
        if (quiz == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        quiz.setQuizTitle(str(body.get("title"), quiz.getQuizTitle()));
        quiz.setQuizDescription(str(body.get("description"), quiz.getQuizDescription()));
        quiz.setPassingScore(intVal(body.get("passingScore"), quiz.getPassingScore()));
        quiz.setTimeLimitMinutes(intVal(body.get("timeLimitMinutes"), quiz.getTimeLimitMinutes()));

        Quiz saved = quizService.updateQuiz(quiz);
        return ResponseEntity.ok(buildQuizResponse(saved, true));
    }

    /**
     * DELETE /instructor/quiz/{quizId}
     */
    @DeleteMapping("/instructor/quiz/{quizId}")
    public ResponseEntity<?> deleteQuiz(@PathVariable int quizId) {
        User user = getAuthUser();
        if (user == null || !isInstructorOrAdmin(user))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        quizService.deleteQuiz(quizId);
        return ResponseEntity.noContent().build();
    }

    // ══════════ Instructor: Questions CRUD ══════════

    /**
     * POST /instructor/quiz/{quizId}/questions
     * Body: { questionText, options: "A|B|C|D", correctOptionIndex: 2, questionOrder: 1 }
     */
    @PostMapping("/instructor/quiz/{quizId}/questions")
    public ResponseEntity<?> addQuestion(@PathVariable int quizId, @RequestBody Map<String, Object> body) {
        User user = getAuthUser();
        if (user == null || !isInstructorOrAdmin(user))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        Quiz quiz = quizService.getQuizById(quizId);
        if (quiz == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        QuizQuestion q = new QuizQuestion();
        q.setQuestionText(str(body.get("questionText"), ""));
        q.setOptions(str(body.get("options"), ""));
        q.setCorrectOptionIndex(intVal(body.get("correctOptionIndex"), 0));
        q.setQuestionOrder(intVal(body.get("questionOrder"), 0));
        q.setQuiz(quiz);

        QuizQuestion saved = quizService.addQuestion(q);
        return ResponseEntity.status(HttpStatus.CREATED).body(buildQuestionResponse(saved, true));
    }

    /**
     * PUT /instructor/quiz/{quizId}/questions/{questionId}
     */
    @PutMapping("/instructor/quiz/{quizId}/questions/{questionId}")
    public ResponseEntity<?> updateQuestion(@PathVariable int quizId, @PathVariable int questionId,
                                            @RequestBody Map<String, Object> body) {
        User user = getAuthUser();
        if (user == null || !isInstructorOrAdmin(user))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        QuizQuestion q = quizService.getQuestionsByQuizId(quizId).stream()
                .filter(qn -> qn.getQuestionId() == questionId).findFirst().orElse(null);
        if (q == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        q.setQuestionText(str(body.get("questionText"), q.getQuestionText()));
        q.setOptions(str(body.get("options"), q.getOptions()));
        q.setCorrectOptionIndex(intVal(body.get("correctOptionIndex"), q.getCorrectOptionIndex()));
        q.setQuestionOrder(intVal(body.get("questionOrder"), q.getQuestionOrder()));

        QuizQuestion saved = quizService.updateQuestion(q);
        return ResponseEntity.ok(buildQuestionResponse(saved, true));
    }

    /**
     * DELETE /instructor/quiz/{quizId}/questions/{questionId}
     */
    @DeleteMapping("/instructor/quiz/{quizId}/questions/{questionId}")
    public ResponseEntity<?> deleteQuestion(@PathVariable int quizId, @PathVariable int questionId) {
        User user = getAuthUser();
        if (user == null || !isInstructorOrAdmin(user))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        quizService.deleteQuestion(questionId);
        return ResponseEntity.noContent().build();
    }

    // ══════════ Student: Take Quiz ══════════

    /**
     * GET /user/quiz/module/{moduleId}
     * Returns quiz + questions for a student (no correct answers shown).
     * Also returns whether they've already passed.
     */
    @GetMapping("/user/quiz/module/{moduleId}")
    public ResponseEntity<?> getQuizForStudent(@PathVariable int moduleId) {
        User user = getAuthUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Quiz> opt = quizService.getQuizByModuleId(moduleId);
        if (opt.isEmpty()) return ResponseEntity.ok(Map.of("hasQuiz", false));

        Quiz quiz = opt.get();
        Map<String, Object> resp = buildQuizResponse(quiz, false); // no correct answers
        resp.put("passed", quizService.hasUserPassedQuiz(user.getId(), quiz.getQuizId()));

        // Include best attempt if exists
        quizService.getBestAttempt(user.getId(), quiz.getQuizId()).ifPresent(best -> {
            resp.put("bestScore", best.getScore());
            resp.put("bestAttemptAt", best.getAttemptedAt().toString());
        });

        return ResponseEntity.ok(resp);
    }

    /**
     * POST /user/quiz/{quizId}/submit
     * Body: { "answers": [0, 2, 1, 3] }  (array of selected option indices)
     * Returns score, pass/fail, and correct answers for review.
     */
    @PostMapping("/user/quiz/{quizId}/submit")
    public ResponseEntity<?> submitQuiz(@PathVariable int quizId, @RequestBody Map<String, Object> body) {
        User user = getAuthUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Quiz quiz = quizService.getQuizById(quizId);
        if (quiz == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        @SuppressWarnings("unchecked")
        List<Integer> answers = ((List<?>) body.get("answers")).stream()
                .map(a -> a instanceof Number ? ((Number) a).intValue() : Integer.parseInt(a.toString()))
                .collect(Collectors.toList());

        QuizAttempt attempt = quizService.submitAttempt(user, quiz, answers);

        // Build response with correct answers for review
        List<QuizQuestion> questions = quizService.getQuestionsByQuizId(quizId);
        List<Map<String, Object>> review = new ArrayList<>();
        for (int i = 0; i < questions.size(); i++) {
            QuizQuestion q = questions.get(i);
            Map<String, Object> r = new HashMap<>();
            r.put("questionId", q.getQuestionId());
            r.put("questionText", q.getQuestionText());
            r.put("options", q.getOptions().split("\\|"));
            r.put("correctOptionIndex", q.getCorrectOptionIndex());
            r.put("userAnswer", i < answers.size() ? answers.get(i) : -1);
            r.put("isCorrect", i < answers.size() && answers.get(i) == q.getCorrectOptionIndex());
            review.add(r);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("attemptId", attempt.getAttemptId());
        result.put("score", attempt.getScore());
        result.put("totalQuestions", attempt.getTotalQuestions());
        result.put("correctAnswers", attempt.getCorrectAnswers());
        result.put("passed", attempt.isPassed());
        result.put("passingScore", quiz.getPassingScore());
        result.put("review", review);

        return ResponseEntity.ok(result);
    }

    /**
     * GET /user/quiz/status/module/{moduleId}
     * Quick check: has the user passed this module's quiz?
     */
    @GetMapping("/user/quiz/status/module/{moduleId}")
    public ResponseEntity<?> getQuizStatus(@PathVariable int moduleId) {
        User user = getAuthUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Quiz> opt = quizService.getQuizByModuleId(moduleId);
        if (opt.isEmpty()) return ResponseEntity.ok(Map.of("hasQuiz", false, "passed", true));

        Quiz quiz = opt.get();
        boolean passed = quizService.hasUserPassedQuiz(user.getId(), quiz.getQuizId());
        Map<String, Object> resp = new HashMap<>();
        resp.put("hasQuiz", true);
        resp.put("quizId", quiz.getQuizId());
        resp.put("passed", passed);
        quizService.getBestAttempt(user.getId(), quiz.getQuizId()).ifPresent(best ->
                resp.put("bestScore", best.getScore()));
        return ResponseEntity.ok(resp);
    }

    // ══════════ Instructor: Test Results ══════════

    /**
     * GET /instructor/quiz/{quizId}/results
     * Returns all student attempts for a specific quiz.
     */
    @GetMapping("/instructor/quiz/{quizId}/results")
    public ResponseEntity<?> getQuizResults(@PathVariable int quizId) {
        User user = getAuthUser();
        if (user == null || !isInstructorOrAdmin(user))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        Quiz quiz = quizService.getQuizById(quizId);
        if (quiz == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        List<QuizAttempt> attempts = quizService.getAttemptsByQuizId(quizId);
        List<Map<String, Object>> results = attempts.stream().map(a -> {
            Map<String, Object> m = new HashMap<>();
            m.put("attemptId", a.getAttemptId());
            m.put("studentName", a.getUser().getUserName());
            m.put("studentId", a.getUser().getId());
            m.put("score", a.getScore());
            m.put("totalQuestions", a.getTotalQuestions());
            m.put("correctAnswers", a.getCorrectAnswers());
            m.put("passed", a.isPassed());
            m.put("attemptedAt", a.getAttemptedAt() != null ? a.getAttemptedAt().toString() : null);
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> resp = new HashMap<>();
        resp.put("quizId", quizId);
        resp.put("quizTitle", quiz.getQuizTitle());
        resp.put("passingScore", quiz.getPassingScore());
        resp.put("totalAttempts", results.size());
        resp.put("passedCount", results.stream().filter(r -> (boolean) r.get("passed")).count());
        resp.put("results", results);

        return ResponseEntity.ok(resp);
    }

    // ══════════ Helpers ══════════

    private Map<String, Object> buildQuizResponse(Quiz quiz, boolean includeCorrect) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("hasQuiz", true);
        resp.put("quizId", quiz.getQuizId());
        resp.put("title", quiz.getQuizTitle());
        resp.put("description", quiz.getQuizDescription());
        resp.put("passingScore", quiz.getPassingScore());
        resp.put("timeLimitMinutes", quiz.getTimeLimitMinutes());
        resp.put("moduleId", quiz.getModule().getModuleId());

        List<QuizQuestion> questions = quizService.getQuestionsByQuizId(quiz.getQuizId());
        resp.put("questions", questions.stream()
                .map(q -> buildQuestionResponse(q, includeCorrect))
                .collect(Collectors.toList()));
        return resp;
    }

    private Map<String, Object> buildQuestionResponse(QuizQuestion q, boolean includeCorrect) {
        Map<String, Object> m = new HashMap<>();
        m.put("questionId", q.getQuestionId());
        m.put("questionText", q.getQuestionText());
        m.put("options", q.getOptions().split("\\|"));
        m.put("questionOrder", q.getQuestionOrder());
        if (includeCorrect) {
            m.put("correctOptionIndex", q.getCorrectOptionIndex());
        }
        return m;
    }

    private static String str(Object val, String def) {
        if (val == null) return def;
        String s = val.toString().trim();
        return s.isEmpty() ? def : s;
    }

    private static int intVal(Object val, int def) {
        if (val instanceof Number) return ((Number) val).intValue();
        try { return Integer.parseInt(val.toString()); } catch (Exception e) { return def; }
    }
}
