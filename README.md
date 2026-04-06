<div align="center">

# 📚 LearnFlow

### A Full-Stack Learning Platform

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)

**LearnFlow** is a role-based Learning Management System (LMS) that allows **Learners** to browse and enroll in courses, **Instructors** to create and manage their own courses, and **Admins** to oversee all platform users.

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
- 🔐 Register an account and log in with HTTP Basic Auth
- 🛒 **Enroll / purchase** published courses
- 📊 View personal **dashboard** with profile info and enrolled courses

### For Instructors (INSTRUCTOR role)
- ✏️ **Create** new courses with title, description, duration, price, cover image, and status
- 📝 **Edit** existing courses (title, description, price, duration, status, cover image)
- 🗑️ **Delete** courses they own
- 🔄 Toggle course status between `DRAFT`, `PUBLISHED`, and `ARCHIVED`
- 👁️ View only their own courses in the **Instructor Studio**

### For Admins (ADMIN role)
- 👥 View a **directory of all registered users** with roles and course counts
- 🔧 Platform-level oversight of the user base

### Platform-Wide
- 🛡️ **Role-Based Access Control (RBAC)** enforced at both the API and UI levels
- 🔑 **HTTP Basic Authentication** with BCrypt password hashing
- ♻️ **Session-persisted credentials** via `sessionStorage` on the frontend
- 📱 **Responsive design** with a collapsible sidebar navigation
- ⚡ **Vite dev proxy** for seamless frontend-to-backend communication

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                     │
│                                                         │
│   React 18 + React Router 6 + Vite Dev Server (:5173)  │
│   ┌─────────┐ ┌─────────┐ ┌──────┐ ┌───────┐          │
│   │  Home   │ │ Catalog │ │Studio│ │ Admin │  ...      │
│   └────┬────┘ └────┬────┘ └──┬───┘ └───┬───┘          │
│        │           │         │         │               │
│        └───────────┴────┬────┴─────────┘               │
│                         │                               │
│                  api/client.js                          │
│             (fetch + Basic Auth header)                  │
└─────────────────────────┬───────────────────────────────┘
                          │  Vite proxy: /api → :8080
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 BACKEND (Spring Boot :8080)              │
│                                                         │
│   ┌──────────────────────────────────────────────────┐  │
│   │            Spring Security Filter Chain           │  │
│   │   • Public: POST /create-user, GET /courses/**   │  │
│   │   • ADMIN:  GET /admin/**                        │  │
│   │   • INSTRUCTOR: /instructor/**                   │  │
│   │   • USER:   /user/**                             │  │
│   └──────────────────┬───────────────────────────────┘  │
│                      │                                   │
│   ┌─────────────┐  ┌┴────────────┐  ┌────────────────┐ │
│   │ Controllers │→ │  Services   │→ │  Repositories  │ │
│   └─────────────┘  └─────────────┘  └───────┬────────┘ │
│                                              │          │
│                                     Spring Data JPA     │
└──────────────────────────────────────────────┬──────────┘
                                               │
                                               ▼
                                    ┌──────────────────┐
                                    │   MySQL 8.0      │
                                    │  learnFlowDB     │
                                    │                  │
                                    │  ┌────────────┐  │
                                    │  │   users     │  │
                                    │  └─────┬──────┘  │
                                    │        │ 1:N     │
                                    │  ┌─────┴──────┐  │
                                    │  │  courses    │  │
                                    │  └────────────┘  │
                                    └──────────────────┘
```

---

## 🛠 Tech Stack

| Layer        | Technology                                         |
| ------------ | -------------------------------------------------- |
| **Frontend** | React 18, React Router 6, Vite 5, Vanilla CSS      |
| **Backend**  | Spring Boot 3.2.5, Spring Security, Spring Data JPA |
| **Database** | MySQL 8.0                                          |
| **Language** | Java 17, JavaScript (ES Modules)                   |
| **Build**    | Maven (backend), Vite (frontend)                   |
| **Auth**     | HTTP Basic Authentication, BCrypt password hashing  |
| **ORM**      | Hibernate (via Spring Data JPA)                    |
| **Tooling**  | Lombok, Spring Boot DevTools                       |

---

## 📦 Prerequisites

Before running LearnFlow, ensure you have the following installed:

| Requirement      | Version      | Notes                        |
| ---------------- | ------------ | ---------------------------- |
| **Java JDK**     | 17+          | `java -version` to verify    |
| **Maven**        | 3.8+         | Or use the included `mvnw`   |
| **Node.js**      | 18+          | `node -v` to verify          |
| **npm**          | 9+           | Bundled with Node.js         |
| **MySQL Server** | 8.0+         | Running on port `3306`       |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Spring
```

### 2. Set Up the Database

```sql
-- Connect to MySQL and create the database
CREATE DATABASE learnFlowDB;
```

> The tables (`users`, `courses`) are auto-created by Hibernate on first run (`ddl-auto=update`).

### 3. Configure the Backend

Edit `Backend/src/main/resources/application.properties` if your MySQL credentials differ:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/learnFlowDB
spring.datasource.username=root
spring.datasource.password=manager
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

LearnFlow uses two tables with a **one-to-many** relationship:

```
┌────────────────────────────┐       ┌────────────────────────────┐
│          users             │       │         courses            │
├────────────────────────────┤       ├────────────────────────────┤
│ id          VARCHAR (UUID) │──┐    │ course_id    INT (AUTO)    │
│ username    VARCHAR        │  │    │ course_name  VARCHAR       │
│ email       VARCHAR (UQ)   │  │    │ course_description TEXT    │
│ age         INT            │  │    │ course_duration   VARCHAR  │
│ password_hash VARCHAR      │  │    │ course_price      VARCHAR  │
│ created_at  DATETIME       │  │    │ course_image      VARCHAR  │
│ roles       VARCHAR        │  │    │ course_status     VARCHAR  │
│                            │  │    │ course_created_at VARCHAR  │
│                            │  │    │ course_updated_at VARCHAR  │
│                            │  └───>│ user_id      VARCHAR (FK)  │
└────────────────────────────┘       └────────────────────────────┘
```

### Key Points
- **User IDs** are generated as UUIDs
- **Course IDs** use auto-increment integers
- **Passwords** are stored as BCrypt hashes (never plaintext)
- **Roles** are stored as a list of strings (e.g., `["USER"]`, `["USER", "INSTRUCTOR"]`)
- **Hibernate** manages DDL — tables are created/updated automatically

---

## ⚙️ Configuration

### Backend (`application.properties`)

| Property                          | Default Value                              | Description                     |
| --------------------------------- | ------------------------------------------ | ------------------------------- |
| `spring.application.name`         | `LearnFlow`                                | Application name                |
| `spring.datasource.url`           | `jdbc:mysql://localhost:3306/learnFlowDB`  | MySQL connection URL            |
| `spring.datasource.username`      | `root`                                     | MySQL username                  |
| `spring.datasource.password`      | `manager`                                  | MySQL password                  |
| `spring.jpa.hibernate.ddl-auto`   | `update`                                   | Auto-create/update schema       |
| `spring.jpa.show-sql`             | `true`                                     | Log SQL queries to console      |

### Frontend (`vite.config.js`)

| Setting        | Value                       | Description                                |
| -------------- | --------------------------- | ------------------------------------------ |
| Dev port       | `5173`                      | Vite dev server port                       |
| API proxy      | `/api` → `localhost:8080`   | Proxies `/api/*` to Spring Boot backend    |
| Rewrite rule   | Strips `/api` prefix        | `/api/courses` → `/courses` on backend     |

### Environment Variables (Frontend)

| Variable         | Default      | Description                                             |
| ---------------- | ------------ | ------------------------------------------------------- |
| `VITE_API_URL`   | (none)       | Override API base URL for production deployments        |

---

## 📁 Project Structure

```
Spring/
├── Backend/                           # Spring Boot Application
│   ├── pom.xml                        # Maven build configuration
│   ├── mvnw / mvnw.cmd               # Maven wrapper scripts
│   └── src/
│       └── main/
│           ├── java/com/lms/
│           │   ├── LearnFlowApplication.java      # Entry point
│           │   ├── config/
│           │   │   └── SpringSecurity.java         # Security filter chain, CORS, BCrypt
│           │   ├── controller/
│           │   │   ├── AdminController.java         # GET /admin — list all users
│           │   │   ├── CourseController.java         # GET /courses — public catalog
│           │   │   ├── HealthCheck.java              # GET /health-check
│           │   │   ├── InstructorController.java     # CRUD under /instructor/**
│           │   │   ├── PublicController.java         # POST /create-user (registration)
│           │   │   └── UserController.java           # PUT /user, POST /user/purchase-course
│           │   ├── model/
│           │   │   ├── Courses.java                  # Course JPA entity
│           │   │   └── User.java                     # User JPA entity
│           │   ├── repository/
│           │   │   ├── CourseRepository.java          # Spring Data JPA (courses)
│           │   │   └── UserRepository.java            # Spring Data JPA (users)
│           │   └── service/
│           │       ├── CourseService.java              # Course business logic
│           │       ├── UserDetailsServiceImpl.java     # Spring Security UserDetailsService
│           │       └── UserService.java                # User business logic + BCrypt
│           └── resources/
│               └── application.properties             # DB config, Hibernate settings
│
├── Frontend/                          # React + Vite SPA
│   ├── package.json                   # Dependencies & scripts
│   ├── vite.config.js                 # Dev server + API proxy
│   ├── index.html                     # HTML entry point
│   └── src/
│       ├── main.jsx                   # React root with BrowserRouter + AuthProvider
│       ├── App.jsx                    # Route definitions
│       ├── App.css                    # Global styles
│       ├── index.css                  # CSS reset / base styles
│       ├── api/
│       │   └── client.js             # API client (fetch wrapper + Basic Auth)
│       ├── context/
│       │   └── AuthContext.jsx       # Auth state (sessionStorage persistence)
│       ├── components/
│       │   ├── Layout.jsx            # App shell: sidebar + footer
│       │   └── Layout.css            # Sidebar, navigation styles
│       └── pages/
│           ├── Home.jsx              # Landing page with hero section
│           ├── Courses.jsx           # Public course catalog + enrollment
│           ├── Login.jsx             # Login form (HTTP Basic Auth)
│           ├── Register.jsx          # Registration form
│           ├── Dashboard.jsx         # User profile + health check
│           ├── Studio.jsx            # Instructor course management (CRUD)
│           └── Admin.jsx             # Admin user directory
│
└── README.md                          # This file
```

---

## 📡 API Reference

### Public Endpoints (No Auth Required)

#### Health Check
```http
GET /health-check
```
Returns `"Ok"` — useful for monitoring and verifying API connectivity.

---

#### Register a New User
```http
POST /create-user
Content-Type: application/json

{
  "userName": "johndoe",
  "email": "john@example.com",
  "age": 25,
  "password": "securePassword123"
}
```
**Response:** `201 Created` with the created user object
- Password is hashed with BCrypt before storage
- Default role: `["USER"]`
- `createdAt` is auto-set to the current timestamp

---

#### List All Courses (Public Catalog)
```http
GET /courses
```
**Response:** `200 OK` with an array of all courses, or `204 No Content` if empty.

---

### Authenticated Endpoints (USER role)

> All authenticated endpoints require an `Authorization: Basic <base64(username:password)>` header.

#### Get / Sync User Profile
```http
PUT /user
Authorization: Basic <credentials>
```
**Response:** `200 OK` with the authenticated user's profile, including roles and enrolled courses.

---

#### Purchase / Enroll in a Course
```http
POST /user/purchase-course/{courseId}
Authorization: Basic <credentials>
```
**Response:** `200 OK` on success. Links the course to the authenticated user.

---

### Instructor Endpoints (INSTRUCTOR role)

#### List My Courses
```http
GET /instructor/get-courses
Authorization: Basic <credentials>
```
**Response:** `200 OK` with an array of courses belonging to the authenticated instructor.

---

#### Create a Course
```http
POST /instructor/create-course
Authorization: Basic <credentials>
Content-Type: application/json

{
  "courseName": "Spring Boot Masterclass",
  "courseDescription": "Learn Spring Boot from scratch",
  "courseDuration": "8 weeks",
  "coursePrice": "$49.99",
  "courseImage": "https://example.com/cover.jpg",
  "courseStatus": "PUBLISHED"
}
```
**Response:** `201 Created` with the created course object.
- `courseCreatedAt` and `courseUpdatedAt` are auto-set
- Course is linked to the authenticated instructor via `user_id`

---

#### Update a Course
```http
PUT /instructor/update-course/{courseId}
Authorization: Basic <credentials>
Content-Type: application/json

{
  "courseName": "Updated Title",
  "courseDescription": "Updated description",
  "courseDuration": "10 weeks",
  "coursePrice": "$59.99",
  "courseImage": "https://example.com/new-cover.jpg",
  "courseStatus": "PUBLISHED"
}
```
**Response:** `200 OK`
- Only the course owner (instructor) can update
- `courseUpdatedAt` is auto-refreshed
- Returns `403 Forbidden` if the course belongs to another instructor

---

#### Delete a Course
```http
DELETE /instructor/delete-course/{courseId}
Authorization: Basic <credentials>
```
**Response:** `204 No Content`
- Only the course owner can delete
- Returns `403 Forbidden` if the course belongs to another instructor

---

### Admin Endpoints (ADMIN role)

#### List All Users
```http
GET /admin
Authorization: Basic <credentials>
```
**Response:** `200 OK` with an array of all users (with roles and courses), or `204 No Content` if empty.

---

## 🔒 Authentication & Authorization

### Authentication Flow

```
┌──────────┐    POST /create-user     ┌─────────────┐
│  Browser │ ─────────────────────────> │  Spring Boot │
│  (React) │ <───────────────────────── │  (Public)    │
│          │    201 + user JSON         └─────────────┘
│          │
│          │    GET /health-check       ┌─────────────┐
│          │ ── Authorization: Basic ──>│  Spring Sec. │
│          │ <─── 200 "Ok" ─────────── │  Filter      │
│          │                            └─────────────┘
│          │    PUT /user               ┌─────────────┐
│          │ ── Authorization: Basic ──>│  UserCtrl    │
│          │ <─── 200 + profile ─────── │  (roles etc) │
│          │                            └─────────────┘
│          │
│          │  Stores {username, password, roles}
│          │  in sessionStorage
└──────────┘
```

### Security Rules

| URL Pattern              | Access              | Description                           |
| ------------------------ | ------------------- | ------------------------------------- |
| `POST /create-user`      | **Public**          | Open registration                     |
| `GET /courses`           | **Public**          | Public course catalog                 |
| `GET /courses/**`        | **Public**          | Course details                        |
| `GET /health-check`      | **Authenticated**   | Any logged-in user                    |
| `PUT /user`              | **Authenticated**   | Get own profile                       |
| `POST /user/**`          | **Authenticated**   | Purchase courses                      |
| `/instructor/**`         | **ROLE_INSTRUCTOR** | Full course CRUD for own courses      |
| `/admin/**`              | **ROLE_ADMIN**      | View all users                        |

### Password Security
- Passwords are **never returned** in API responses (`@JsonProperty(access = WRITE_ONLY)`)
- Hashed with **BCrypt** before storage
- Verified via `DaoAuthenticationProvider` with Spring Security

### Roles
Users can hold one or more roles:
- `USER` — default role assigned at registration
- `INSTRUCTOR` — can create/manage courses (must be assigned by modifying the DB or by an admin)
- `ADMIN` — can view all users

---

## 🖥 Frontend Pages

| Route          | Page Component | Auth Required | Role Required  | Description                                        |
| -------------- | -------------- | ------------- | -------------- | -------------------------------------------------- |
| `/`            | `Home`         | No            | —              | Landing page with hero section and feature tiles   |
| `/courses`     | `Courses`      | No            | —              | Public course catalog with enrollment buttons      |
| `/register`    | `Register`     | No            | —              | User registration form                             |
| `/login`       | `Login`        | No            | —              | Login form with credential validation              |
| `/dashboard`   | `Dashboard`    | Yes           | Any            | User profile, API health, enrolled courses count   |
| `/studio`      | `Studio`       | Yes           | INSTRUCTOR     | Course CRUD management with table + create form    |
| `/teach`       | `Studio`       | Yes           | INSTRUCTOR     | Alias route for the Instructor Studio              |
| `/admin`       | `Admin`        | Yes           | ADMIN          | User directory table                               |

### Frontend Auth State
- Credentials are stored in `sessionStorage` under key `learnflow_auth`
- The `AuthContext` provides `isAuthenticated`, `isInstructor`, `login()`, `logout()`, and `refreshRoles()` to all components
- The sidebar dynamically shows/hides navigation links based on the user's authentication state and roles

---

## 📊 Data Models

### User Entity

| Field          | Type              | Column            | Constraints                  |
| -------------- | ----------------- | ----------------- | ---------------------------- |
| `id`           | `String` (UUID)   | `id`              | Primary Key, auto-generated  |
| `userName`     | `String`          | `username`        | Not null                     |
| `email`        | `String`          | `email`           | Not null, unique             |
| `age`          | `int`             | `age`             | —                            |
| `password`     | `String`          | `password_hash`   | Not null, write-only in JSON |
| `createdAt`    | `LocalDateTime`   | `created_at`      | Auto-set at registration     |
| `roles`        | `List<String>`    | `roles`           | Default: `["USER"]`          |
| `courses`      | `List<Courses>`   | (mapped by user)  | One-to-many relationship     |

### Courses Entity

| Field              | Type      | Column              | Constraints                  |
| ------------------ | --------- | ------------------- | ---------------------------- |
| `courseId`          | `int`     | `course_id`         | Primary Key, auto-increment  |
| `courseName`       | `String`  | `course_name`       | Not null                     |
| `courseDescription` | `String` | `course_description`| Not null                     |
| `courseDuration`   | `String`  | `course_duration`   | Not null                     |
| `coursePrice`       | `String`  | `course_price`      | Not null                     |
| `courseImage`       | `String`  | `course_image`      | Not null                     |
| `courseStatus`      | `String`  | `course_status`     | Not null (`DRAFT` / `PUBLISHED` / `ARCHIVED`) |
| `courseCreatedAt`   | `String`  | `course_created_at` | Not null, auto-set           |
| `courseUpdatedAt`   | `String`  | `course_updated_at` | Not null, auto-set           |
| `user`             | `User`    | `user_id` (FK)      | Not null, many-to-one        |

---

## 🌐 CORS Configuration

The backend allows cross-origin requests from the frontend dev servers:

| Setting            | Value                                             |
| ------------------ | ------------------------------------------------- |
| Allowed Origins    | `http://localhost:5173`, `http://localhost:4173`   |
| Allowed Methods    | `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`|
| Allowed Headers    | `Authorization`, `Content-Type`, `Accept`         |
| Max Age            | `3600` seconds (1 hour)                           |

---

## 🧪 Running in Production

### Build the Frontend
```bash
cd Frontend
npm run build        # Output in Frontend/dist/
npm run preview      # Preview the production build on :4173
```

### Build the Backend
```bash
cd Backend
./mvnw clean package -DskipTests
java -jar target/LearnFlow-0.0.1-SNAPSHOT.jar
```

### Environment Variables for Production
- Set `VITE_API_URL` to the backend URL (e.g., `https://api.learnflow.com`) before building the frontend
- Update `spring.datasource.*` properties with production database credentials
- Consider disabling `spring.jpa.show-sql` in production

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
