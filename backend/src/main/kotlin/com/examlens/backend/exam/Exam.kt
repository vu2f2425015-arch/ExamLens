package com.examlens.backend.exam

import com.examlens.backend.common.BaseEntity
import jakarta.persistence.*
import java.time.Instant

enum class ExamStatus {
    SCHEDULED, ACTIVE, CONCLUDED
}

@Entity
@Table(name = "exams")
class Exam(
    @Column(nullable = false)
    var title: String,

    @Column(nullable = false)
    var subjectCode: String,

    var faculty: String = "",

    @Column(nullable = false)
    var scheduledStart: Instant,

    @Column(nullable = false)
    var scheduledEnd: Instant,

    @Column(nullable = false)
    var durationMinutes: Int,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: ExamStatus = ExamStatus.SCHEDULED,

    var totalMarks: Int = 100,

    var passingMarks: Int = 40,

    var totalQuestions: Int = 0,

    var enrolledStudents: Int = 0,

    var description: String = ""
) : BaseEntity()
