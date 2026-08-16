package com.examlens.backend.exam

import jakarta.validation.constraints.*
import java.time.Instant
import java.util.UUID

data class CreateExamRequest(
    @field:NotBlank(message = "Title is required")
    val title: String,

    @field:NotBlank(message = "Subject code is required")
    val subjectCode: String,

    val faculty: String = "",

    @field:NotNull(message = "Scheduled start is required")
    val scheduledStart: Instant,

    @field:NotNull(message = "Scheduled end is required")
    val scheduledEnd: Instant,

    @field:Min(1)
    val durationMinutes: Int,

    val totalMarks: Int = 100,
    val passingMarks: Int = 40,
    val totalQuestions: Int = 0,
    val enrolledStudents: Int = 0,
    val description: String = ""
)

data class UpdateExamRequest(
    val title: String? = null,
    val subjectCode: String? = null,
    val faculty: String? = null,
    val scheduledStart: Instant? = null,
    val scheduledEnd: Instant? = null,
    val durationMinutes: Int? = null,
    val status: ExamStatus? = null,
    val totalMarks: Int? = null,
    val passingMarks: Int? = null,
    val totalQuestions: Int? = null,
    val enrolledStudents: Int? = null,
    val description: String? = null
)

data class ExamResponse(
    val id: UUID,
    val title: String,
    val subjectCode: String,
    val faculty: String,
    val scheduledStart: Instant,
    val scheduledEnd: Instant,
    val durationMinutes: Int,
    val status: ExamStatus,
    val totalMarks: Int,
    val passingMarks: Int,
    val totalQuestions: Int,
    val enrolledStudents: Int,
    val description: String,
    val createdAt: Instant
)

fun Exam.toResponse() = ExamResponse(
    id = id!!,
    title = title,
    subjectCode = subjectCode,
    faculty = faculty,
    scheduledStart = scheduledStart,
    scheduledEnd = scheduledEnd,
    durationMinutes = durationMinutes,
    status = status,
    totalMarks = totalMarks,
    passingMarks = passingMarks,
    totalQuestions = totalQuestions,
    enrolledStudents = enrolledStudents,
    description = description,
    createdAt = createdAt
)
