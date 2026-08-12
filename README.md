<div align="center">

# 📚 LearnFlow

### A Production-Grade Full-Stack Learning Management System

![Status](https://img.shields.io/badge/Status-✅%20Completed-brightgreen?style=for-the-badge)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Video%20Storage-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![HLS](https://img.shields.io/badge/HLS-Adaptive%20Streaming-FF6600?style=for-the-badge&logo=videolan&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)

![Lines of Code](https://img.shields.io/badge/Lines%20of%20Code-9900+-blue?style=for-the-badge)
![REST Endpoints](https://img.shields.io/badge/REST%20Endpoints-50+-green?style=for-the-badge)
![JPA Entities](https://img.shields.io/badge/JPA%20Entities-10-orange?style=for-the-badge)

**LearnFlow** is a role-based Learning Management System (LMS) that allows **Learners** to browse, enroll in, and watch courses with HLS adaptive streaming, **Instructors** to create and manage their full course content (including video uploads, quizzes, and analytics), and **Admins** to oversee all platform users.

> 🎉 **This project is now complete.** All planned features — including role-based access control, HLS video streaming, quiz engine, progress tracking, and course analytics — have been fully implemented, tested, and deployed.

🔗 **[Live Demo → learnflow.laveshgaur.com](https://learnflow.laveshgaur.com)**

[Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Architecture](#-architecture) · [Project Structure](#-project-structure)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Database Setup](#-database-setup)
- [Configuration](#%EF%B8%8F-configuration)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Authentication & Authorization](#-authentication--authorization)
- [Frontend Pages](#-frontend-pages)
- [Data Models](#-data-models)
- [CORS Configuration](#-cors-configuration)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### For Learners (USER role)
- 📖 Browse the **public course catalog** without authentication
- 🔐 Register an account and log in with JWT Authentication
- 🛒 **Enroll / purchase** published courses
- 📊 View personal **dashboard** with profile info and enrolled courses
- 🎬 **Course Viewer** — browse modules, chapters, and watch videos
  - **HLS adaptive streaming** via `hls.js` with automatic quality adjustment
  - Automatic **MP4 fallback** if HLS is unavailable or fails
  - Native HLS support on Safari; `hls.js` polyfill on Chrome/Firefox/Edge
  - Desktop: fixed two-column layout (syllabus + content side-by-side)
  - Mobile: tab-based layout (📚 Syllabus / 📖 Content switch)
- 📈 **Progress Tracking** — automatic chapter completion based on video watch progress
  - Per-video watch percentage tracked in real time
  - Chapters auto-complete when all videos are ≥90% watched **and** ≥30 seconds spent
  - Resume playback from last-known position
- 📝 **Module Quizzes** — take quizzes at the end of each module
  - Multiple-choice questions with optional time limits
  - Instant scoring with pass/fail result and answer review
  - Best score tracking across multiple attempts

### For Instructors (INSTRUCTOR role)
- ✏️ **Create** new courses via a dedicated **Create Course** page with cover image upload
- 📝 **Edit** existing courses
- 🗑️ **Delete** courses they own
- 🔄 Toggle course status between `DRAFT`, `PUBLISHED`, and `ARCHIVED`
- 📦 **Manage Modules** — create and delete modules per course
- 📄 **Manage Chapters** — create and delete chapters per module
- 🎬 **Upload Videos** to chapters via **direct-to-Cloudinary signed upload** (with real-time progress bar)
- 🔄 Backend automatically converts Cloudinary URLs to **HLS `.m3u8` streaming URLs** before saving
- 🗑️ **Delete Videos** — removes both the Cloudinary file and the database record atomically
- 📝 **Quiz Builder** — create module tests with multiple-choice questions, passing scores, and time limits
- 📊 **Course Analytics** — view enrollment counts, content breakdown, and student completion rates
- 📋 **Quiz Results** — view all student attempts, scores, and pass/fail statistics per quiz

### For Admins (ADMIN role)
- 👥 View a **directory of all registered users** with roles and course counts
- ➕ **Create new users** directly from the admin panel with a styled role-picker form
- 🗑️ **Delete users** from the platform (with self-deletion protection to prevent admin lock-out)

### Platform-Wide
- 🛡️ **Role-Based Access Control (RBAC)** enforced at both the API and UI levels
- 🔑 **JWT (JSON Web Token) Authentication** with BCrypt password hashing
- ♻️ **Session-persisted credentials** via `localStorage` on the frontend
- 📱 **Responsive design** — collapsible sidebar + mobile-optimised course viewer
- ⚡ **Vite dev proxy** for seamless frontend-to-backend communication

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                     │
│                                                         │
│   React 18 + React Router 6 + Vite Dev Server (:5173)  │
│   ┌──────┐ ┌────────┐ ┌──────┐ ┌───────┐ ┌─────────┐  │
│   │ Home │ │Catalog │ │Studio│ │ Admin │ │ Viewer  │  │
│   └──┬───┘ └───┬────┘ └──┬───┘ └───┬───┘ └────┬────┘  │
│      └─────────┴──────────┴─────────┴──────────┘       │
│                         │                               │
│              api/client.js + api/modules.js             │
│             (fetch + JWT Bearer token)                   │
└─────────────────────────┬───────────────────────────────┘
                          │  Vite proxy: /api → :8080
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 BACKEND (Spring Boot :8080)              │
│                                                         │
│   ┌──────────────────────────────────────────────────┐  │
│   │            Spring Security Filter Chain           │  │
│   │   • Public: POST /create-user, GET /courses/**   │  │
│   │   • ADMIN:  GET /admin/**, POST /admin/**        │  │
│   │   • INSTRUCTOR: /instructor/**                   │  │
│   │   • USER:   /user/**                             │  │
│   │   • JwtFilter validates JWT token in header      │  │
│   └──────────────────┬───────────────────────────────┘  │
│                      │                                   │
│   ┌─────────────┐  ┌┴────────────┐  ┌────────────────┐ │
│   │ Controllers │→ │  Services   │→ │  Repositories  │ │
│   └─────────────┘  └──────┬──────┘  └───────┬────────┘ │
│                            │                 │          │
│                   FileUploadService    Spring Data JPA  │
│                   (Cloudinary SDK)            │         │
│                   + HLS URL gen               │         │
└────────────────────────────┼─────────────────┼─────────┘
                             │                 │
                    ┌────────┴────┐    ┌───────┴──────────┐
                    │  Cloudinary │    │    MySQL 8.0      │
                    │  (videos +  │    │   learnFlowDB     │
                    │  HLS m3u8)  │    │                   │
                    └─────────────┘    └──────────────────┘
```

---

## 🛠 Tech Stack

| Layer         | Technology                                                     |
| ------------- | -------------------------------------------------------------- |
| **Frontend**  | React 18.3, React Router 6, Vite, Vanilla CSS Design System    |
| **Backend**   | Spring Boot 3.2.5, Spring Security, Spring Data JPA            |
| **Database**  | MySQL 8.0 (10 JPA entities, Hibernate auto-DDL)                |
| **Storage**   | Cloudinary (video upload & delete via SDK, HLS streaming)      |
| **Streaming** | HLS (HTTP Live Streaming) via Cloudinary `.m3u8`, `hls.js`    |
| **Language**  | Java 17, JavaScript (ES Modules)                               |
| **Build**     | Maven (backend), Vite (frontend)                               |
| **Auth**      | JWT (JSON Web Token), BCrypt password hashing                  |
| **ORM**       | Hibernate (via Spring Data JPA)                                |
| **Tooling**   | Lombok, Spring Boot DevTools, SLF4J logging                    |

---

## 📦 Prerequisites

| Requirement        | Version | Notes                      |
| ------------------ | ------- | -------------------------- |
| **Java JDK**       | 17+     | `java -version` to verify  |
| **Maven**          | 3.8+    | Or use the included `mvnw` |
| **Node.js**        | 18+     | `node -v` to verify        |
| **npm**            | 9+      | Bundled with Node.js       |
| **MySQL Server**   | 8.0+    | Running on port `3306`     |
| **Cloudinary acct**| Any     | Free tier is sufficient    |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd LearnFlow
```

### 2. Set Up the Database

```sql
CREATE DATABASE learnFlowDB;
```

> Tables are auto-created by Hibernate on first run (`ddl-auto=update`).

### 3. Configure the Backend

Edit `Backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/learnFlowDB
spring.datasource.username=root
spring.datasource.password=manager

# Cloudinary credentials
cloudinary.cloud-name=your_cloud_name
cloudinary.api-key=your_api_key
cloudinary.api-secret=your_api_secret
```

### 4. Start the Backend

```bash
cd Backend
./mvnw spring-boot:run
```

The Spring Boot server starts at **http://localhost:8080**.

### 5. Start the Frontend

```bash
cd Frontend
npm install
npm run dev
```

The Vite dev server starts at **http://localhost:5173** with API proxy to `:8080`.

### 6. Open in Browser

Navigate to **http://localhost:5173** and you're ready to go!

---

## 🗄 Database Setup

### Schema Overview

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│      users       │1──N │     courses       │1──N │     modules      │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ id (UUID PK)     │     │ course_id (PK)    │     │ module_id (PK)   │
│ username         │     │ course_name       │     │ module_name      │
│ email (UQ)       │     │ course_desc       │     │ module_desc      │
│ age              │     │ course_duration   │     │ ...              │
│ password_hash    │     │ course_price      │     │ course_id (FK)   │
│ roles            │     │ course_status     │     └────────┬─────────┘
│ created_at       │     │ user_id (FK)      │         1 │     │ 1
└──────────────────┘     └──────────────────┘           │     │
                                                    N │     │ 1
                                              ┌────────┴──┐  ┌┴─────────────────┐
                                              │ chapters  │  │     quizzes      │
                                              ├───────────┤  ├──────────────────┤
                                              │chapter_id │  │ quiz_id (PK)     │
                                              │chapter_name│  │ quiz_title       │
                                              │chapter_desc│  │ passing_score    │
                                              │module_id  │  │ time_limit_mins  │
                                              └─────┬─────┘  │ module_id (FK,UQ)│
                                               1 │  │ 1      └────────┬─────────┘
                                               N │  │ N          1 │  │ 1
                                        ┌────────┴┐ ┌┴──────────┐  │  │
                                        │ videos  │ │ chapter_  │  N │  N
                                        ├─────────┤ │ progress  │ ┌──┴────────────┐
                                        │video_id │ ├───────────┤ │quiz_questions │
                                        │video_   │ │user_id(FK)│ ├──────────────┤
                                        │ title   │ │chapter_id │ │question_id   │
                                        │video_url│ │completed  │ │question_text │
                                        │cloud_id │ │time_spent │ │options       │
                                        │duration │ └───────────┘ │correct_index │
                                        │chapter_ │               │quiz_id (FK)  │
                                        │ id (FK) │               └──────────────┘
                                        └────┬────┘
                                          1  │
                                          N  │           ┌──────────────────┐
                                        ┌────┴────────┐  │  quiz_attempts   │
                                        │video_       │  ├──────────────────┤
                                        │ progress    │  │ attempt_id (PK)  │
                                        ├─────────────┤  │ user_id (FK)     │
                                        │user_id (FK) │  │ quiz_id (FK)     │
                                        │video_id(FK) │  │ score            │
                                        │watch_percent│  │ passed           │
                                        │last_position│  │ answers_json     │
                                        └─────────────┘  │ attempted_at     │
                                                         └──────────────────┘
```

### Key Points
- **User IDs** are UUIDs; **all other IDs** use auto-increment integers
- **Passwords** are stored as BCrypt hashes (never plaintext)
- **Video URLs** store Cloudinary **HLS `.m3u8`** URLs (not raw MP4 links)
- **`cloudinary_public_id`** is persisted for reliable deletion without URL parsing
- **Each module** can have **one quiz** (one-to-one); each quiz has **many questions**
- **Progress** is tracked per-user at both the **chapter level** (completion + time spent) and **video level** (watch percent + position)
- **Quiz attempts** record score, pass/fail, and the user's answers as JSON
- **Hibernate** manages DDL — tables created/updated automatically

---

## ⚙️ Configuration

### Backend (`application.properties`)

| Property                        | Default Value                             | Description                  |
| ------------------------------- | ----------------------------------------- | ---------------------------- |
| `spring.datasource.url`         | `jdbc:mysql://localhost:3306/learnFlowDB` | MySQL connection URL         |
| `spring.datasource.username`    | `root`                                    | MySQL username               |
| `spring.datasource.password`    | `manager`                                 | MySQL password               |
| `spring.jpa.hibernate.ddl-auto` | `update`                                  | Auto-create/update schema    |
| `spring.jpa.show-sql`           | `true`                                    | Log SQL to console           |
| `cloudinary.cloud-name`         | —                                         | Cloudinary cloud name        |
| `cloudinary.api-key`            | —                                         | Cloudinary API key           |
| `cloudinary.api-secret`         | —                                         | Cloudinary API secret        |

### Frontend (`vite.config.js`)

| Setting       | Value                     | Description                             |
| ------------- | ------------------------- | --------------------------------------- |
| Dev port      | `5173`                    | Vite dev server port                    |
| API proxy     | `/api` → `localhost:8080` | Proxies `/api/*` to Spring Boot backend |
| Rewrite rule  | Strips `/api` prefix      | `/api/courses` → `/courses` on backend  |

---

## 📁 Project Structure

```
LearnFlow/
├── Backend/                              # Spring Boot Application
│   ├── pom.xml
│   └── src/main/java/com/lms/
│       ├── config/
│       │   ├── AdminConfig.java              # Auto-creates default admin user
│       │   ├── CloudinaryConfig.java          # Cloudinary SDK bean
│       │   └── SpringSecurity.java            # Security filter chain + CORS
│       ├── controller/
│       │   ├── AdminController.java           # GET /admin — list all users
│       │   ├── CourseController.java           # GET /courses — public catalog
│       │   ├── InstructorController.java       # Course/video CRUD + analytics
│       │   ├── ModuleController.java           # Module CRUD
│       │   ├── ChapterController.java          # Chapter CRUD
│       │   ├── VideoController.java            # GET videos by chapter
│       │   ├── QuizController.java             # Quiz/question CRUD + student quiz
│       │   ├── ProgressController.java         # Chapter/video progress tracking
│       │   ├── UserController.java             # Profile + purchase
│       │   ├── PublicController.java           # POST /sign-up, POST /login
│       │   └── HealthCheck.java                # GET /health-check
│       ├── dto/
│       │   ├── request/                        # CourseRequest, VideoUploadRequest, etc.
│       │   ├── response/                       # CourseResponse, UserResponse, etc.
│       │   └── mapper/DtoMapper.java           # Entity → DTO mappers
│       ├── filter/
│       │   └── JwtFilter.java                  # Intercepts and validates JWTs
│       ├── utils/
│       │   └── JwtUtil.java                    # JWT generation and validation
│       ├── model/
│       │   ├── User.java
│       │   ├── Course.java
│       │   ├── Module.java
│       │   ├── Chapter.java
│       │   ├── Video.java
│       │   ├── Quiz.java                       # One-to-one with Module
│       │   ├── QuizQuestion.java               # MCQ questions (pipe-separated options)
│       │   ├── QuizAttempt.java                # Student quiz submissions
│       │   ├── ChapterProgress.java            # Per-user chapter completion
│       │   └── VideoProgress.java              # Per-user video watch tracking
│       ├── repository/
│       │   ├── UserRepository.java
│       │   ├── CourseRepository.java
│       │   ├── ModuleRepository.java
│       │   ├── ChapterRepository.java
│       │   ├── VideoRepository.java
│       │   ├── QuizRepository.java
│       │   ├── QuizQuestionRepository.java
│       │   ├── QuizAttemptRepository.java
│       │   ├── ChapterProgressRepository.java
│       │   └── VideoProgressRepository.java
│       └── service/
│           ├── UserService.java
│           ├── UserDetailsServiceImpl.java
│           ├── CourseService.java
│           ├── ModuleService.java
│           ├── ChapterService.java
│           ├── VideoService.java
│           ├── FileUploadService.java          # Cloudinary upload, delete & HLS
│           ├── QuizService.java                # Quiz CRUD, grading, attempts
│           ├── ChapterProgressService.java     # Chapter completion tracking
│           ├── VideoProgressService.java       # Video watch progress tracking
│           └── ValidityChecker.java            # Input validation utilities
│
├── Frontend/                             # React + Vite SPA
│   └── src/
│       ├── api/
│       │   ├── client.js                  # Base fetch wrapper + instructor APIs
│       │   ├── modules.js                # Module/chapter/video API calls
│       │   ├── progress.js               # Progress tracking API calls
│       │   └── quiz.js                   # Quiz CRUD + student quiz API calls
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── components/
│       │   ├── VideoPlayer.jsx           # HLS player (hls.js + MP4 fallback)
│       │   ├── Layout.jsx
│       │   └── Layout.css
│       └── pages/
│           ├── Home.jsx
│           ├── Courses.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Dashboard.jsx
│           ├── Studio.jsx                # Instructor course list + CRUD
│           ├── CreateCourse.jsx          # Dedicated course creation form
│           ├── StudioCourse.jsx          # Module/chapter/video/quiz builder
│           ├── Analytics.jsx             # Course analytics dashboard
│           ├── CourseViewer.jsx          # Learner chapter + video + quiz viewer
│           └── Admin.jsx                 # Admin user directory + create user
│
├── FUNCTIONAL_DOCUMENT.md
└── README.md
```

---

## 📡 API Reference

### Public Endpoints

```http
GET  /health-check
POST /sign-up
POST /login
GET  /courses
GET  /courses/**
```

---

### Authenticated (USER role)

```http
PUT  /user                                 # Get own profile
POST /user/purchase-course/{courseId}      # Enroll in a course
GET  /courses/{courseId}/modules           # List modules (enrolled users)
GET  /courses/{courseId}/modules/{moduleId}/chapters
GET  /courses/{courseId}/modules/{moduleId}/chapters/{chapterId}/videos
```

---

### Instructor Endpoints (INSTRUCTOR role)

```http
GET    /instructor/get-courses
POST   /instructor/create-course
PUT    /instructor/update-course/{courseId}
DELETE /instructor/delete-course/{courseId}

GET    /instructor/cloudinary-signature     # signed upload params
POST   /instructor/upload-cover             # cover image upload (multipart)
POST   /instructor/save-video              # JSON: { chapterId, title, publicId, videoUrl }
DELETE /instructor/delete-video/{videoId}  # deletes from Cloudinary + DB

GET    /instructor/analytics/{courseId}     # course metrics & completion rates

GET    /course/{courseId}/modules
POST   /course/{courseId}/modules
PUT    /course/{courseId}/modules/{moduleId}
DELETE /course/{courseId}/modules/{moduleId}

GET    /courses/{courseId}/modules/{moduleId}/chapters
POST   /courses/{courseId}/modules/{moduleId}/chapters
DELETE /courses/{courseId}/modules/{moduleId}/chapters/{chapterId}
```

---

### Quiz Endpoints (INSTRUCTOR role)

```http
GET    /instructor/quiz/module/{moduleId}           # get quiz for a module
POST   /instructor/quiz/module/{moduleId}           # create quiz
PUT    /instructor/quiz/{quizId}                    # update quiz settings
DELETE /instructor/quiz/{quizId}                    # delete quiz

POST   /instructor/quiz/{quizId}/questions          # add question
PUT    /instructor/quiz/{quizId}/questions/{qId}    # update question
DELETE /instructor/quiz/{quizId}/questions/{qId}    # delete question

GET    /instructor/quiz/{quizId}/results            # view all student attempts
```

---

### Quiz Endpoints (USER role)

```http
GET    /user/quiz/module/{moduleId}                 # get quiz (no correct answers)
POST   /user/quiz/{quizId}/submit                   # submit answers, get score
GET    /user/quiz/status/module/{moduleId}           # check if passed
```

---

### Progress Tracking Endpoints (USER role)

```http
GET    /user/progress/course/{courseId}              # chapter progress + quiz statuses
POST   /user/progress/video/{videoId}               # update video watch progress
GET    /user/progress/videos/{chapterId}             # per-video watch data
```

> **Video upload flow:**
> 1. Frontend requests a **signed upload** via `GET /instructor/cloudinary-signature`
> 2. File is uploaded **directly from the browser to Cloudinary** (no backend proxy) with real-time progress
> 3. Frontend sends the Cloudinary `public_id` and `secure_url` to `POST /instructor/save-video`
> 4. Backend converts the URL to an **HLS `.m3u8`** URL and stores it alongside the `cloudinary_public_id`

> **Video delete flow:** The server uses the stored `cloudinary_public_id` to call `cloudinary.uploader().destroy()` with `resource_type: video`, then deletes the DB record. Older videos without a stored `publicId` fall back to URL parsing.

---

### 🎥 Video Streaming Pipeline

```
┌──────────┐    Direct upload     ┌─────────────┐
│ Browser  │ ──────────────────▶  │ Cloudinary  │
│ (client) │    (signed, XHR)     │   (CDN)     │
└────┬─────┘                      └──────┬──────┘
     │                                   │
     │ POST /save-video                  │ Stores original
     │ { publicId, videoUrl }            │ video file
     ▼                                   │
┌──────────┐  Converts URL to .m3u8      │
│ Backend  │ ──────────────────────────▶  │
│ (Spring) │  Saves HLS URL + publicId   │
└────┬─────┘                              │
     │                                    │
     ▼ DB stores .m3u8 URL                │
┌──────────┐                              │
│  MySQL   │                              │
└──────────┘                              │
                                          │
┌──────────┐  GET .m3u8 stream   ┌────────┴─────┐
│ Learner  │ ◀──────────────────│  Cloudinary   │
│ Browser  │   (via hls.js)      │  HLS (m3u8)  │
│ + hls.js │                     └──────────────┘
└──────────┘
     │
     │ Fallback: if HLS fails → direct .mp4 playback
```

**Key details:**
- **`hls.js`** handles adaptive bitrate streaming in Chrome, Firefox, and Edge
- **Safari** uses native HLS support (`application/vnd.apple.mpegurl`)
- **Automatic MP4 fallback** — if HLS manifest loading fails, the player switches to direct `.mp4` playback
- **No video data passes through the backend** — uploads go browser → Cloudinary; streams go Cloudinary → browser

---

### Admin Endpoints (ADMIN role)

```http
GET    /admin                                # List all users
POST   /admin/create-user                    # Create user with explicit roles
DELETE /admin/delete-user/{userId}           # Delete a user (self-delete prevented)
```

---

## 🔒 Authentication & Authorization

### Security Rules

| URL Pattern                     | Access              | Description                          |
| ------------------------------- | ------------------- | ------------------------------------ |
| `POST /sign-up`                 | **Public**          | Open registration                    |
| `POST /login`                   | **Public**          | Authentication                       |
| `GET /health-check`             | **Public**          | Health check                         |
| `GET /courses`, `/courses/**`   | **Public**          | Public course catalog                |
| `/user/**`                      | **Authenticated**   | Profile, purchases, progress, quizzes|
| `/instructor/**`                | **ROLE_INSTRUCTOR** | Course/video/quiz CRUD + analytics   |
| `/admin/**`                     | **ROLE_ADMIN**      | View, create, and delete users       |

### Roles
| Role         | Assigned by         | Capabilities                                |
| ------------ | ------------------- | ------------------------------------------- |
| `USER`       | Default at register | Browse, enroll, watch courses               |
| `INSTRUCTOR` | Admin / DB          | All USER abilities + course/video management|
| `ADMIN`      | DB                  | All USER abilities + user management (CRUD) |

---

## 🖥 Frontend Pages

| Route                              | Page             | Auth | Role        | Description                                    |
| ---------------------------------- | ---------------- | ---- | ----------- | ---------------------------------------------- |
| `/`                                | `Home`           | No   | —           | Landing page                                   |
| `/courses`                         | `Courses`        | No   | —           | Public catalog + enrollment                    |
| `/register`                        | `Register`       | No   | —           | Registration form                              |
| `/login`                           | `Login`          | No   | —           | Login form                                     |
| `/dashboard`                       | `Dashboard`      | Yes  | Any         | Profile + health check + enrolled courses      |
| `/studio`                          | `Studio`         | Yes  | INSTRUCTOR  | Course list + edit / delete                    |
| `/studio/new`                      | `CreateCourse`   | Yes  | INSTRUCTOR  | Dedicated course creation form                 |
| `/studio/course/:id`               | `StudioCourse`   | Yes  | INSTRUCTOR  | Module/chapter/video/quiz builder              |
| `/studio/course/:id/analytics`     | `Analytics`      | Yes  | INSTRUCTOR  | Course analytics dashboard                     |
| `/course/:id`                      | `CourseViewer`   | Yes  | Any         | Chapter viewer with video player + quizzes     |
| `/admin`                           | `Admin`          | Yes  | ADMIN       | User directory + create user form              |

---

## 📊 Data Models

### Video Entity

| Field               | Type     | Column                  | Constraints                 |
| ------------------- | -------- | ----------------------- | --------------------------- |
| `videoId`           | `int`    | `video_id`              | PK, auto-increment          |
| `videoTitle`        | `String` | `video_title`           | Not null                    |
| `videoUrl`          | `String` | `video_url`             | Cloudinary HLS `.m3u8` URL  |
| `cloudinaryPublicId`| `String` | `cloudinary_public_id`  | Cloudinary asset identifier |
| `durationInSeconds` | `int`    | `duration_in_seconds`   | Not null                    |
| `chapter`           | `Chapter`| `chapter_id` (FK)       | Many-to-one                 |

---

## 🌐 CORS Configuration

| Setting          | Value                                                             |
| ---------------- | ----------------------------------------------------------------- |
| Allowed Origins  | `http://localhost:*`, `https://learnflow.laveshgaur.com`          |
| Allowed Methods  | `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`                |
| Allowed Headers  | `Authorization`, `Content-Type`, `Accept`                         |
| Credentials      | Allowed                                                           |
| Max Age          | `3600` seconds                                                    |

---

## 🧪 Running in Production

```bash
# Frontend
cd Frontend
npm run build
npm run preview      # Preview on :4173

# Backend
cd Backend
./mvnw clean package -DskipTests
java -jar target/LearnFlow-0.0.1-SNAPSHOT.jar
```

Set `VITE_API_URL` to your backend URL before building the frontend.

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 📌 Project Status

This project is **✅ Completed**. All core features have been fully implemented and deployed:

| Feature                         | Status |
| ------------------------------- | ------ |
| JWT Authentication & RBAC       | ✅ Done |
| Course CRUD (Instructor)        | ✅ Done |
| Module / Chapter / Video CRUD   | ✅ Done |
| HLS Adaptive Video Streaming    | ✅ Done |
| Direct-to-Cloudinary Upload     | ✅ Done |
| Quiz Engine (Builder + Player)  | ✅ Done |
| Progress Tracking (Video + Chapter) | ✅ Done |
| Course Analytics Dashboard      | ✅ Done |
| Admin User Management (CRUD)    | ✅ Done |
| Responsive Mobile UI            | ✅ Done |
| Production Deployment           | ✅ Done |

---

<div align="center">

**Built with ❤️ using Spring Boot & React**

</div>
