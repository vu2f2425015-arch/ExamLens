# ExamLens — University Examination & Proctoring Authority Portal

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Kotlin](https://img.shields.io/badge/Kotlin-2.0-7F52FF?logo=kotlin&logoColor=white)](https://kotlinlang.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Theme](https://img.shields.io/badge/Theme-Light%20%2F%20Dark-1E2B37)](https://github.com/vu2f2425015-arch/ExamLens)

**ExamLens** is an institutional-grade, AI-powered full-stack online examination and automated proctoring platform designed for university examination boards, proctors, faculty members, and student candidates.

Built with an authoritative academic visual register, ExamLens pairs archival paper aesthetics, crisp typography, and institutional telemetry with real-time proctoring features, live monitoring desks, full light/dark theme support, and a robust Kotlin + Spring Boot REST API backend.

---

## 🏗️ Architecture & Tech Stack

### Frontend Architecture
- **Framework & Core**: React 19, JavaScript (ESNext), HTML5
- **Build Tooling**: Vite 8
- **Routing**: React Router 7
- **Icons & Motion**: React Icons (`md`), Framer Motion
- **Data Visualization**: Recharts
- **Styling**: Vanilla CSS Modules with tokenized CSS custom properties (`globals.css`)

### Backend Architecture
- **Language**: Kotlin 2.0
- **Framework**: Spring Boot 3.4
- **Persistence**: Spring Data JPA + Hibernate
- **Database**: H2 (In-Memory for Dev) / PostgreSQL (Production)
- **Security & Auth**: Spring Security + JWT (Stateless access & refresh tokens)
- **API Documentation**: `springdoc-openapi` (Swagger UI at `/swagger-ui.html`)
- **Build System**: Gradle (Kotlin DSL)

---

## ✨ Key Features

- **🎓 Multi-Role Authority Desk**: Dedicated portals for **Admin / Proctor**, **Faculty / Teacher**, and **Student Candidate** with role-based JWT authorization.
- **🛡️ Real-Time AI Proctoring Desk**: Automated multi-face detection, phone/object detection, audio volume anomaly telemetry, and proctor warning dispatch.
- **📜 Ruled Paper Question Sheet Interface**: Exam sitting view with candidate palette grid, chronometer desk timer (`01:24:10`), and monospace question item audit tags (`[ AUDIT REF: #Q-ALG-04 ]`).
- **📊 Proctoring Control Center**: Real-time live monitoring grid, anomaly alert log, candidate status stamps, live proctor-to-candidate chat, and Recharts analytics.
- **📄 Official Academic Transcripts**: Verified exam completion results view with grade stamps (`[ RESULT: SATISFACTORY / PASSED ]`), category breakdowns, and performance analytics.
- **🌗 Complete Institutional Light & Dark Themes**: Tokenized CSS design system with instant toggle, `localStorage` persistence, and OS preference auto-detection.
- **📥 CSV Bulk Student Ingestion & Management**: Admin panel with paginated student vault, search/filter controls, and CSV student batch import.

---

## 🔑 Access Credentials

### Frontend Demo Access
| Role | Email / ID | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Administrator / Proctor** | `admin@university.edu` | `admin123` | Proctoring Desk, Live Streams, AI Anomaly Feed, Exam Setup, Student Vault |
| **Faculty / Teacher** | `teacher@university.edu` | `teacher123` | Division Management, Exam Assignment, Alerts & Monitoring, Class Results |
| **Student Candidate** | `student@university.edu` | `student123` | Candidate Portal, Scheduled Exams, Exam Sitting Desk, Transcripts |

### Backend Default Admin
On first boot, the Spring Boot backend seeds a default administrator:
```
Email:    admin@examlens.edu
Password: admin123
```

---

## 🎨 Design System & Typography

- **Display Face**: `Newsreader` (Editorial serif for portal titles, headers, and transcript seals)
- **Workhorse Body Face**: `IBM Plex Sans` (For forms, tables, and candidate lists)
- **Monospace Telemetry Face**: `IBM Plex Mono` (For roll numbers, audit tags, chronometers, and telemetry logs)
- **Color Palette**:
  - **Light Theme**: Archival Parchment (`#F7F6F2`), Oxford Slate (`#1E2B37`), Fountain Pen Ink (`#0F2042`), Ruled Line Border (`#D9D7CE`)
  - **Dark Theme**: Unified Dark Navy (`#0B1320`), Elevated Surface (`#132032`), Sidebar Panel (`#0F1A2A`), High-Contrast Text (`#F8FAFC`, `#CBD5E1`)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ (recommended for Frontend)
- **JDK**: 17+ (verified: OpenJDK Temurin 17+ for Backend)

---

### 1. Running the Frontend (React + Vite)

```bash
# Clone the repository
git clone https://github.com/vu2f2425015-arch/ExamLens.git
cd ExamLens

# Install frontend dependencies
npm install

# Launch frontend dev server (runs at http://localhost:5173)
npm run dev
```

---

### 2. Running the Backend (Kotlin + Spring Boot)

```bash
# Navigate to backend directory
cd backend

# Start the Spring Boot application (runs at http://localhost:8080)
./gradlew.bat bootRun     # On Windows
# ./gradlew bootRun       # On Linux / macOS
```

Once running:
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **H2 Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console) (JDBC URL: `jdbc:h2:mem:examlens`, User: `sa`, Password: *empty*)

---

## 🔌 API Endpoints Overview

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/admin/login` | Admin/Proctor authentication |
| **Auth** | `POST` | `/api/auth/student/login` | Student authentication |
| **Auth** | `POST` | `/api/auth/student/activate` | Student roster activation |
| **Students** | `GET` / `POST` | `/api/students` | List/filter & create students |
| **Students** | `POST` | `/api/students/import` | CSV bulk student roster import |
| **Exams** | `GET` / `POST` | `/api/exams` | Exam management & scheduling |
| **Results** | `GET` / `POST` | `/api/results` | Submit exam results & transcripts |
| **Alerts** | `GET` / `POST` | `/api/alerts` | AI Proctoring anomaly violation logs |
| **Dashboard** | `GET` | `/api/dashboard/metrics` | Real-time telemetry & metrics |

---

## 📁 Project Structure

```
ExamLens/
├── public/                 # Static assets (favicons, system SVG icons)
├── src/                    # Frontend React 19 source code
│   ├── components/         # Shared institutional UI components
│   │   ├── AIStatusBadge/  # Official rectangular status stamps
│   │   ├── ActivityLog/    # Real-time proctoring audit ledger
│   │   ├── ChartCard/      # Paper card wrapper for Recharts
│   │   ├── DashboardCard/  # Ruled metric cards
│   │   ├── LiveChat/       # Proctor-candidate messaging desk
│   │   ├── Navbar/         # Top navigation bar with status ticker
│   │   ├── QuestionPalette/# Candidate answer sheet palette
│   │   ├── Sidebar/        # Oxford slate / Dark navy authority navigation
│   │   ├── ThemeToggle/    # Light / Dark mode sliding pill toggle
│   │   ├── WarningPopup/   # Official proctoring notice paper popup
│   │   └── WebcamPanel/    # Video monitor overlay with face detection grid
│   ├── context/            # React contexts (AuthContext, ThemeContext)
│   ├── data/               # Exam datasets, questions, alerts, students
│   ├── hooks/              # Custom hooks (useAIProctor, useExamState, useTimer)
│   ├── pages/              # Admin, Teacher, Student, Exam, and Login pages
│   ├── styles/             # Global CSS design tokens (globals.css)
│   └── utils/              # Helper utilities and formatters
├── backend/                # Kotlin + Spring Boot 3.4 REST API service
│   ├── src/main/kotlin/    # Backend Kotlin source files
│   │   └── com/examlens/backend/
│   │       ├── alert/      # AI Proctoring alerts domain
│   │       ├── auth/       # JWT & Spring Security domain
│   │       ├── config/     # Security, CORS, OpenAPI, & DataSeeder config
│   │       ├── dashboard/  # Telemetry dashboard domain
│   │       ├── exam/       # Exam management domain
│   │       ├── result/     # Results & grading domain
│   │       └── student/    # Student roster & CSV import domain
│   ├── build.gradle.kts    # Gradle build configuration
│   └── postman/            # Postman API Collection
├── package.json            # Frontend scripts & dependencies
└── vite.config.js          # Vite configuration
```

---

## 🛠️ Building for Production

### Build Frontend
```bash
npm run build     # Outputs static assets to dist/
npm run preview   # Previews production build locally
```

### Build Backend
```bash
cd backend
./gradlew.bat build   # Compiles Kotlin code & runs unit tests
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.

