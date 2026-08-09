package com.examlens.backend.config

import com.examlens.backend.auth.AdminRole
import com.examlens.backend.auth.AdminUser
import com.examlens.backend.auth.AdminUserRepository
import com.examlens.backend.exam.Exam
import com.examlens.backend.exam.ExamRepository
import com.examlens.backend.exam.ExamStatus
import com.examlens.backend.question.Question
import com.examlens.backend.question.QuestionRepository
import com.examlens.backend.recording.Recording
import com.examlens.backend.recording.RecordingRepository
import com.examlens.backend.settings.SystemSettings
import com.examlens.backend.settings.SystemSettingsRepository
import com.examlens.backend.student.Student
import com.examlens.backend.student.StudentRepository
import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import java.time.Instant

@Component
class DataSeeder(
    private val adminUserRepository: AdminUserRepository,
    private val examRepository: ExamRepository,
    private val questionRepository: QuestionRepository,
    private val recordingRepository: RecordingRepository,
    private val settingsRepository: SystemSettingsRepository,
    private val studentRepository: StudentRepository,
    private val passwordEncoder: PasswordEncoder
) : ApplicationRunner {

    private val logger = LoggerFactory.getLogger(DataSeeder::class.java)

    override fun run(args: ApplicationArguments?) {
        // 1. Seed Admin
        if (adminUserRepository.count() == 0L) {
            val admin = AdminUser(
                email = "admin@examlens.edu",
                passwordHash = passwordEncoder.encode("admin123"),
                fullName = "Dr. Admin Kumar",
                role = AdminRole.ADMIN
            )
            adminUserRepository.save(admin)
            logger.info("Seeded default admin: admin@examlens.edu / admin123")
        }

        // 2. Seed System Settings
        if (settingsRepository.count() == 0L) {
            settingsRepository.save(SystemSettings())
            logger.info("Seeded default platform system settings")
        }

        // 3. Seed Exams
        if (examRepository.count() == 0L) {
            val e1 = Exam(
                title = "Data Structures & Algorithms - End-Sem",
                subjectCode = "CS301",
                faculty = "Prof. R. K. Sharma",
                scheduledStart = Instant.now().minusSeconds(3600),
                scheduledEnd = Instant.now().plusSeconds(7200),
                durationMinutes = 90,
                status = ExamStatus.ACTIVE,
                totalMarks = 100,
                passingMarks = 40,
                totalQuestions = 4,
                enrolledStudents = 120,
                description = "Comprehensive evaluation covering Trees, Graphs, Sorting Algorithms, and Dynamic Programming."
            )
            val e2 = Exam(
                title = "Database Management Systems",
                subjectCode = "CS302",
                faculty = "Dr. Anita Desai",
                scheduledStart = Instant.now().plusSeconds(86400),
                scheduledEnd = Instant.now().plusSeconds(93600),
                durationMinutes = 60,
                status = ExamStatus.SCHEDULED,
                totalMarks = 50,
                passingMarks = 20,
                totalQuestions = 3,
                enrolledStudents = 95,
                description = "Relational algebra, SQL queries, normalization up to BCNF, and ACID transaction properties."
            )
            val e3 = Exam(
                title = "Computer Networks - Mid-Term",
                subjectCode = "CS303",
                faculty = "Prof. S. N. Varma",
                scheduledStart = Instant.now().minusSeconds(172800),
                scheduledEnd = Instant.now().minusSeconds(165600),
                durationMinutes = 60,
                status = ExamStatus.CONCLUDED,
                totalMarks = 50,
                passingMarks = 20,
                totalQuestions = 3,
                enrolledStudents = 110,
                description = "OSI layer architecture, TCP/IP, IP routing algorithms, and subnetting exercises."
            )
            examRepository.saveAll(listOf(e1, e2, e3))
            logger.info("Seeded 3 default exam papers")
        }

        // 4. Seed Questions
        if (questionRepository.count() == 0L) {
            val q1 = Question(
                examId = "EXAM_001",
                question = "What is the worst-case time complexity of QuickSort algorithm?",
                options = mutableListOf("O(N log N)", "O(N²)", "O(N)", "O(log N)"),
                correctOption = 1,
                marks = 25
            )
            val q2 = Question(
                examId = "EXAM_001",
                question = "Which data structure follows the Last-In-First-Out (LIFO) principle?",
                options = mutableListOf("Queue", "Binary Tree", "Stack", "Linked List"),
                correctOption = 2,
                marks = 25
            )
            val q3 = Question(
                examId = "EXAM_001",
                question = "What is the height of a balanced binary search tree with N nodes?",
                options = mutableListOf("O(N)", "O(log N)", "O(N log N)", "O(1)"),
                correctOption = 1,
                marks = 25
            )
            val q4 = Question(
                examId = "EXAM_001",
                question = "Which traversal technique visits the root node first, followed by left and right subtrees?",
                options = mutableListOf("In-order", "Pre-order", "Post-order", "Level-order"),
                correctOption = 1,
                marks = 25
            )
            questionRepository.saveAll(listOf(q1, q2, q3, q4))
            logger.info("Seeded default examination questions")
        }

        // 5. Seed Anomaly Recordings
        if (recordingRepository.count() == 0L) {
            val r1 = Recording(
                studentId = "STU_CS2026010",
                studentName = "Aarav Sharma",
                examId = "EXAM_001",
                examName = "Data Structures & Algorithms",
                alert = "Multiple Faces Detected in Frame",
                severity = "critical",
                duration = "0:35",
                size = "14.2 MB",
                timestamp = "14:22:05"
            )
            val r2 = Recording(
                studentId = "STU_EC2026011",
                studentName = "Riya Sen",
                examId = "EXAM_001",
                examName = "Data Structures & Algorithms",
                alert = "Secondary Screen / Tab Switch Flagged",
                severity = "warning",
                duration = "0:40",
                size = "11.8 MB",
                timestamp = "14:35:12"
            )
            recordingRepository.saveAll(listOf(r1, r2))
            logger.info("Seeded default anomaly recording clips")
        }

        // 6. Seed Sample Students
        if (studentRepository.count() == 0L) {
            val s1 = Student(
                rollNumber = "CS2026010",
                fullName = "Aarav Sharma",
                officialEmail = "aarav.sharma@examlens.edu",
                department = "Computer Science",
                semester = 5,
                gpa = 8.8,
                isActivated = true,
                passcodeHash = passwordEncoder.encode("student123")
            )
            val s2 = Student(
                rollNumber = "EC2026011",
                fullName = "Riya Sen",
                officialEmail = "riya.sen@examlens.edu",
                department = "Electronics",
                semester = 5,
                gpa = 9.2,
                isActivated = true,
                passcodeHash = passwordEncoder.encode("student123")
            )
            studentRepository.saveAll(listOf(s1, s2))
            logger.info("Seeded default sample students")
        }
    }
}
