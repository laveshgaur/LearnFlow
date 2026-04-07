# Functional Document - LearnFlow LMS

## 1) Purpose
This document defines the functional behavior of the LearnFlow Learning Management System (LMS), based on the current implementation and the upcoming AI-based learner help feature.

## 2) Project Scope
LearnFlow currently supports:
- User registration and authentication
- Role-based access control (`ADMIN`, `INSTRUCTOR`, `USER`)
- Public course catalog browsing
- Instructor course management (create, view own courses, update, delete)
- User course purchase
- Admin user listing

Planned scope addition:
- AI assistant for answering course-related learner questions

## 3) User Roles
- `Guest` (unauthenticated): can create account and view course list
- `User`: can update own profile context and purchase courses
- `Instructor`: can manage own courses
- `Admin`: can view all users

## 4) Functional Modules

### 4.1 Authentication and Authorization
- System uses HTTP Basic authentication.
- Passwords are stored as BCrypt hashes.
- Access control rules:
  - Public:
    - `POST /create-user`
    - `GET /courses` and `GET /courses/**`
  - Authenticated users:
    - `/user/**`
  - Instructor only:
    - `/instructor/**`
  - Admin only:
    - `/admin/**`

### 4.2 User Management
- `POST /create-user`
  - Creates a new user.
  - Sets:
    - `createdAt` to current timestamp
    - `roles` default to `USER`
    - encrypted password
- `PUT /user`
  - Updates the currently logged-in user context.
  - Returns updated user data.

### 4.3 Course Catalog
- `GET /courses`
  - Returns all available courses.
  - Response:
    - `200 OK` with course list when available
    - `204 No Content` when no courses exist

### 4.4 Instructor Course Management
- `GET /instructor/get-courses`
  - Returns courses owned by the logged-in instructor.
- `POST /instructor/create-course`
  - Creates a new course tied to the logged-in instructor.
  - Auto-fills `courseCreatedAt` and `courseUpdatedAt` if absent.
- `PUT /instructor/update-course/{courseId}`
  - Updates a course only if it belongs to the logged-in instructor.
  - Refreshes `courseUpdatedAt`.
- `DELETE /instructor/delete-course/{courseId}`
  - Deletes a course only if it belongs to the logged-in instructor.

### 4.5 Course Purchase
- `POST /user/purchase-course/{courseId}`
  - Allows authenticated user to purchase a course.
  - Validates course existence.
  - Links purchased course to current user.

### 4.6 Admin Operations
- `GET /admin`
  - Returns all users in the platform.
  - Response:
    - `200 OK` with data
    - `204 No Content` when user list is empty

## 5) Data Entities

### 5.1 User
- `id` (UUID)
- `userName`
- `email` (unique)
- `age`
- `password` (write-only in API, hashed in DB)
- `createdAt`
- `roles` (list of role names)
- `courses` (owned/purchased relation)

### 5.2 Courses
- `courseId` (auto-increment)
- `courseName`
- `courseDescription`
- `courseDuration`
- `coursePrice`
- `courseImage`
- `courseStatus`
- `courseCreatedAt`
- `courseUpdatedAt`
- `user` (owner/instructor relation)

## 6) Non-Functional Expectations
- Security:
  - BCrypt hashing for passwords
  - Role-gated endpoints
- Compatibility:
  - CORS allows local frontend origins (`localhost:5173`, `localhost:4173`)
- API style:
  - REST endpoints with status-code based responses

## 7) Planned Feature: AI Assistant for Course Questions

### 7.1 Goal
Provide a built-in AI assistant that answers learner questions specifically related to course content, reducing instructor support load and increasing learner engagement.

### 7.2 Target Users
- Primary: `USER` learners enrolled in a course
- Secondary (future): `INSTRUCTOR` for content QA preview

### 7.3 Functional Requirements
- FR-AI-01: Learner can ask natural language questions from a course page.
- FR-AI-02: System answers using only relevant course content/context.
- FR-AI-03: System stores question-answer history per user and course.
- FR-AI-04: System shows fallback message when confidence is low.
- FR-AI-05: Learner can flag an answer as helpful/not helpful.
- FR-AI-06: Instructor can review flagged AI responses (future admin tool).

### 7.4 Suggested API Contract (Future)
- `POST /user/courses/{courseId}/ai/ask`
  - Request:
    - `question`
  - Response:
    - `answer`
    - `confidence`
    - `sources` (optional references)
- `GET /user/courses/{courseId}/ai/history`
  - Returns user conversation history for that course.
- `POST /user/courses/{courseId}/ai/feedback`
  - Captures helpful/not-helpful and optional comment.

### 7.5 Validation and Access Rules
- Only authenticated users can use AI endpoints.
- User must have purchased/enrolled in the course before asking AI questions.
- Input validation:
  - empty question rejected
  - max question length enforced
- Rate limits per user to prevent abuse.

### 7.6 AI Safety and Quality Rules
- Restrict answers to course domain/context.
- Avoid hallucination by returning "I do not know from this course content" when needed.
- Never return sensitive user or system data.
- Log prompts/responses for quality monitoring (with privacy controls).

## 8) Acceptance Criteria (Current + AI Phase)
- AC-01: New user can register and login successfully.
- AC-02: Guest can view course catalog.
- AC-03: Instructor can create, update, delete only own courses.
- AC-04: User can purchase existing course.
- AC-05: Admin can fetch user list.
- AC-06 (AI): Purchased user can ask course question and receive response.
- AC-07 (AI): Unenrolled user cannot access AI endpoint for that course.
- AC-08 (AI): AI fallback appears when answer confidence is low.

## 9) Out of Scope (Current Phase)
- Payment gateway integration
- Multi-language AI responses
- Advanced analytics dashboard for AI interactions
- Real-time voice assistant

## 10) Recommended Next Implementation Steps for AI
1. Add enrollment check utility for AI endpoint authorization.
2. Create `AiQueryController` and `AiQueryService`.
3. Add persistence model for AI chat history and feedback.
4. Integrate an LLM provider through configurable service layer.
5. Add monitoring, rate limiting, and test coverage.

