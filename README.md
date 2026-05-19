<div align="center">

# 📚 LearnFlow

### A Full-Stack Learning Management System

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Video%20Storage-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)

**LearnFlow** is a role-based Learning Management System (LMS) that allows **Learners** to browse, enroll in, and watch courses, **Instructors** to create and manage their full course content (including video uploads), and **Admins** to oversee all platform users.

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
  - Desktop: fixed two-column layout (syllabus + content side-by-side)
  - Mobile: tab-based layout (📚 Syllabus / 📖 Content switch)

### For Instructors (INSTRUCTOR role)
- ✏️ **Create** new courses with title, description, duration, price, cover image, and status
- 📝 **Edit** existing courses
- 🗑️ **Delete** courses they own
- 🔄 Toggle course status between `DRAFT`, `PUBLISHED`, and `ARCHIVED`
- 📦 **Manage Modules** — create and delete modules per course
- 📄 **Manage Chapters** — create and delete chapters per module
- 🎬 **Upload Videos** to chapters via Cloudinary (with real-time feedback)
- 🗑️ **Delete Videos** — removes both the Cloudinary file and the database record atomically

### For Admins (ADMIN role)
- 👥 View a **directory of all registered users** with roles and course counts
- ➕ **Create new users** directly from the admin panel with a styled role-picker form

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
└────────────────────────────┼─────────────────┼─────────┘
                             │                 │
                    ┌────────┴────┐    ┌───────┴──────────┐
                    │  Cloudinary │    │    MySQL 8.0      │
                    │  (videos)   │    │   learnFlowDB     │
                    └─────────────┘    └──────────────────┘
```

---

## 🛠 Tech Stack

| Layer         | Technology                                                     |
| ------------- | -------------------------------------------------------------- |
| **Frontend**  | React 18, React Router 6, Vite 5, Vanilla CSS                  |
| **Backend**   | Spring Boot 3.2.5, Spring Security, Spring Data JPA            |
| **Database**  | MySQL 8.0                                                      |
| **Storage**   | Cloudinary (video upload & delete via SDK)                     |
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
│ created_at       │     │ user_id (FK)      │              │ 1
└──────────────────┘     └──────────────────┘              │ N
                                                   ┌────────┴─────────┐
                                                   │     chapters     │
                                                   ├──────────────────┤
                                                   │ chapter_id (PK)  │
                                                   │ chapter_name     │
                                                   │ chapter_desc     │
                                                   │ module_id (FK)   │
                                                   └────────┬─────────┘
                                                            │ 1
                                                            │ N
                                                   ┌────────┴─────────┐
                                                   │      videos      │
                                                   ├──────────────────┤
                                                   │ video_id (PK)    │
                                                   │ video_title      │
                                                   │ video_url        │
                                                   │ duration_seconds │
                                                   │ chapter_id (FK)  │
                                                   └──────────────────┘
```

### Key Points
- **User IDs** are UUIDs; **all other IDs** use auto-increment integers
- **Passwords** are stored as BCrypt hashes (never plaintext)
- **Video URLs** point to Cloudinary CDN; the `publicId` is derived at delete time
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
│       ├── controller/
│       │   ├── AdminController.java          # GET /admin — list all users
│       │   ├── CourseController.java          # GET /courses — public catalog
│       │   ├── InstructorController.java      # Course/video CRUD /instructor/**
│       │   ├── ModuleController.java          # Module CRUD
│       │   ├── ChapterController.java         # Chapter CRUD
│       │   ├── VideoController.java           # GET videos by chapter
│       │   ├── UserController.java            # Profile + purchase
│       │   └── PublicController.java          # POST /create-user
│       │   ├── dto/
│       │   │   ├── request/                   # Request DTOs
│       │   │   ├── response/                  # Response DTOs
│       │   │   └── mapper/DtoMapper.java      # Entity to DTO mappers
│       │   ├── filter/
│       │   │   └── JwtFilter.java             # Intercepts and validates JWTs
│       │   ├── utils/
│       │   │   └── JwtUtil.java               # JWT generation and validation
│       │   ├── model/
│       │   ├── User.java
│       │   ├── Course.java
│       │   ├── Module.java
│       │   ├── Chapter.java
│       │   └── Video.java
│       ├── repository/
│       │   ├── UserRepository.java
│       │   ├── CourseRepository.java
│       │   ├── ModuleRepository.java
│       │   ├── ChapterRepository.java
│       │   └── VideoRepository.java
│       └── service/
│           ├── UserService.java
│           ├── CourseService.java
│           ├── ModuleService.java
│           ├── ChapterService.java
│           ├── VideoService.java
│           └── FileUploadService.java         # Cloudinary upload & delete
│
├── Frontend/                             # React + Vite SPA
│   └── src/
│       ├── api/
│       │   ├── client.js                 # Base fetch wrapper + instructor APIs
│       │   └── modules.js               # Module/chapter/video API calls
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── components/
│       │   ├── Layout.jsx
│       │   └── Layout.css
│       └── pages/
│           ├── Home.jsx
│           ├── Courses.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Dashboard.jsx
│           ├── Studio.jsx               # Instructor course list + CRUD
│           ├── StudioCourse.jsx         # Module/chapter/video builder
│           ├── CourseViewer.jsx         # Learner chapter + video viewer
│           └── Admin.jsx                # Admin user directory + create user
│
└── README.md
```

---

## 📡 API Reference

### Public Endpoints

```http
GET  /health-check
POST /create-user
GET  /courses
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

POST   /instructor/upload-video            # multipart: chapterId, title, file
DELETE /instructor/delete-video/{videoId}  # deletes from Cloudinary + DB

GET    /course/{courseId}/modules
POST   /course/{courseId}/modules
PUT    /course/{courseId}/modules/{moduleId}
DELETE /course/{courseId}/modules/{moduleId}

GET    /courses/{courseId}/modules/{moduleId}/chapters
POST   /courses/{courseId}/modules/{moduleId}/chapters
DELETE /courses/{courseId}/modules/{moduleId}/chapters/{chapterId}
```

> **Video delete flow:** The server extracts `lms_uploads/<filename>` as the Cloudinary `publicId`, calls `cloudinary.uploader().destroy()` with `resource_type: video`, then deletes the DB record.

---

### Admin Endpoints (ADMIN role)

```http
GET  /admin                                # List all users
POST /admin/create-user                    # Create user with explicit roles
```

---

## 🔒 Authentication & Authorization

### Security Rules

| URL Pattern                     | Access              | Description                          |
| ------------------------------- | ------------------- | ------------------------------------ |
| `POST /create-user`             | **Public**          | Open registration                    |
| `GET /courses`                  | **Public**          | Public course catalog                |
| `GET /health-check`             | **Authenticated**   | Any logged-in user                   |
| `PUT /user`                     | **Authenticated**   | Get own profile                      |
| `POST /user/**`                 | **Authenticated**   | Purchase courses                     |
| `/instructor/**`                | **ROLE_INSTRUCTOR** | Full course + video CRUD             |
| `/admin/**`                     | **ROLE_ADMIN**      | View and create users                |

### Roles
| Role         | Assigned by         | Capabilities                                |
| ------------ | ------------------- | ------------------------------------------- |
| `USER`       | Default at register | Browse, enroll, watch courses               |
| `INSTRUCTOR` | Admin / DB          | All USER abilities + course/video management|
| `ADMIN`      | DB                  | All USER abilities + user directory + create|

---

## 🖥 Frontend Pages

| Route                    | Page             | Auth | Role        | Description                                    |
| ------------------------ | ---------------- | ---- | ----------- | ---------------------------------------------- |
| `/`                      | `Home`           | No   | —           | Landing page                                   |
| `/courses`               | `Courses`        | No   | —           | Public catalog + enrollment                    |
| `/register`              | `Register`       | No   | —           | Registration form                              |
| `/login`                 | `Login`          | No   | —           | Login form                                     |
| `/dashboard`             | `Dashboard`      | Yes  | Any         | Profile + health check + enrolled courses      |
| `/studio`                | `Studio`         | Yes  | INSTRUCTOR  | Course list + create / edit / delete           |
| `/studio/course/:id`     | `StudioCourse`   | Yes  | INSTRUCTOR  | Module/chapter builder + video upload/delete   |
| `/courses/:id/view`      | `CourseViewer`   | Yes  | Any         | Chapter viewer with video player               |
| `/admin`                 | `Admin`          | Yes  | ADMIN       | User directory + create user form              |

---

## 📊 Data Models

### Video Entity

| Field               | Type     | Column             | Constraints                 |
| ------------------- | -------- | ------------------ | --------------------------- |
| `videoId`           | `int`    | `video_id`         | PK, auto-increment          |
| `videoTitle`        | `String` | `video_title`      | Not null                    |
| `videoUrl`          | `String` | `video_url`        | Cloudinary secure URL       |
| `durationInSeconds` | `int`    | `duration_in_seconds` | Not null                 |
| `chapter`           | `Chapter`| `chapter_id` (FK)  | Many-to-one                 |

---

## 🌐 CORS Configuration

| Setting          | Value                                              |
| ---------------- | -------------------------------------------------- |
| Allowed Origins  | `http://localhost:5173`, `http://localhost:4173`   |
| Allowed Methods  | `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS` |
| Allowed Headers  | `Authorization`, `Content-Type`, `Accept`          |
| Max Age          | `3600` seconds                                     |

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

<div align="center">

**Built with ❤️ using Spring Boot & React**

</div>
