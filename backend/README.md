# ExamLens Backend — Kotlin + Spring Boot

REST API backend for ExamLens — a University Examination & Automated Proctoring Portal.

## Tech Stack

| Layer        | Technology                              |
| ------------ | --------------------------------------- |
| Language     | Kotlin                                  |
| Framework    | Spring Boot 3.4                         |
| Persistence  | Spring Data JPA + Hibernate             |
| Database     | H2 (dev) / PostgreSQL (prod)            |
| Auth         | Spring Security + JWT (access + refresh)|
| API Docs     | springdoc-openapi (Swagger UI)          |
| Build        | Gradle (Kotlin DSL)                     |
| Testing      | JUnit5 + MockMvc                        |

## Quick Start

### Prerequisites
- **JDK 17+** (verified: OpenJDK Temurin 17.0.19)

### Run Locally (H2 dev database)
```bash
cd backend
./gradlew.bat bootRun
```

The server starts on **http://localhost:8080**.

### Verify
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **H2 Console**: http://localhost:8080/h2-console (JDBC URL: `jdbc:h2:mem:examlens`, user: `sa`, no password)

### Default Admin Credentials
On first boot, a default admin is seeded:
```
Email:    admin@examlens.edu
Password: admin123
```

## Environment Variables

| Variable         | Default                    | Description                  |
| ---------------- | -------------------------- | ---------------------------- |
| `JWT_SECRET`     | (dev default, 256-bit key) | HMAC-SHA256 signing secret   |
| `PORT`           | `8080`                     | Server port                  |
| `CORS_ORIGINS`   | `http://localhost:5173`    | Comma-separated allowed origins |
| `DATABASE_URL`   | (H2 in-memory)             | PostgreSQL JDBC URL (prod)   |
| `DB_USERNAME`    | `examlens`                 | Database username (prod)     |
| `DB_PASSWORD`    | `examlens`                 | Database password (prod)     |

### Production (PostgreSQL)
```bash
./gradlew.bat bootRun --args='--spring.profiles.active=prod' \
  -DDATABASE_URL=jdbc:postgresql://host:5432/examlens \
  -DDB_USERNAME=your_user \
  -DDB_PASSWORD=your_pass \
  -DJWT_SECRET=your-production-secret-min-32-chars
```

## API Endpoints

### Authentication (Public)
| Method | Endpoint                       | Description                       |
| ------ | ------------------------------ | --------------------------------- |
| POST   | `/api/auth/admin/login`        | Admin login → JWT                 |
| POST   | `/api/auth/student/activate`   | Roster activation (roll + email)  |
| POST   | `/api/auth/student/login`      | Student login → JWT               |
| POST   | `/api/auth/refresh`            | Refresh access token              |

### Students (Admin-protected)
| Method | Endpoint                | Description                      |
| ------ | ----------------------- | -------------------------------- |
| GET    | `/api/students`         | Paginated list (filter: dept, sem)|
| GET    | `/api/students/{id}`    | Get by ID                        |
| POST   | `/api/students`         | Create student                   |
| PUT    | `/api/students/{id}`    | Update student                   |
| DELETE | `/api/students/{id}`    | Delete student                   |
| POST   | `/api/students/import`  | CSV bulk import                  |
| DELETE | `/api/students/purge`   | Purge all (X-Confirm-Purge: true)|

### Exams
| Method | Endpoint            | Description     |
| ------ | ------------------- | --------------- |
| GET    | `/api/exams`        | List all        |
| GET    | `/api/exams/{id}`   | Get by ID       |
| POST   | `/api/exams`        | Create (admin)  |
| PUT    | `/api/exams/{id}`   | Update (admin)  |
| DELETE | `/api/exams/{id}`   | Delete (admin)  |

### Results
| Method | Endpoint                          | Description                  |
| ------ | --------------------------------- | ---------------------------- |
| GET    | `/api/results`                    | List (filter: examId, studentId) |
| POST   | `/api/results`                    | Submit result (admin)        |
| GET    | `/api/results/student/{studentId}`| Student's own results        |

### Alerts (AI Proctoring)
| Method | Endpoint                     | Description             |
| ------ | ---------------------------- | ----------------------- |
| GET    | `/api/alerts`                | List (filter: examId, status) |
| POST   | `/api/alerts`                | Log violation event     |
| PATCH  | `/api/alerts/{id}/status`    | Resolve/unresolve alert |

### Dashboard
| Method | Endpoint                  | Description              |
| ------ | ------------------------- | ------------------------ |
| GET    | `/api/dashboard/metrics`  | Aggregated telemetry     |

## CSV Import Format
```csv
rollNumber,name,email,department,semester,gpa
CS2026010,Aarav Sharma,aarav.sharma@examlens.edu,Computer Science,5,8.8
EC2026011,Riya Sen,riya.sen@examlens.edu,Electronics,5,9.2
```

## Postman Collection
Import `postman/ExamLens_API.postman_collection.json` into Postman. Run "Admin Login" first to auto-set the `adminToken` variable, then run other requests sequentially.

## Project Structure
```
src/main/kotlin/com/examlens/backend/
├── ExamLensBackendApplication.kt
├── config/       (Security, CORS, OpenAPI, DataSeeder)
├── auth/         (JWT, filters, controller/service, AdminUser entity)
├── student/      (entity, repository, service, controller, DTOs)
├── exam/         (entity, repository, service, controller, DTOs)
├── result/       (entity, repository, service, controller, DTOs)
├── alert/        (entity, repository, service, controller, DTOs)
├── dashboard/    (controller, service, DTOs)
└── common/       (BaseEntity, error handling, pagination)
```

## Build & Test
```bash
./gradlew.bat build    # compile + test
./gradlew.bat test     # run tests only
```
