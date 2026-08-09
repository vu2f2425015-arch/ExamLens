package com.examlens.backend.result

import jakarta.validation.constraints.*
import java.time.Instant
import java.util.UUID

data class CreateResultRequest(
    @field:NotNull(message = "Exam ID is required")
    val examId: UUID,

    @field:NotNull(message = "Student ID is required")
    val studentId: UUID,

    @field:DecimalMin("0.0")
    val score: Double,

    @field:DecimalMin("1.0")
    val maxScore: Double = 100.0,

    val aiConfidenceScore: Double? = null
)

data class ResultResponse(
    val id: UUID,
    val examId: UUID,
    val studentId: UUID,
    val score: Double,
    val maxScore: Double,
    val percentage: Double,
    val aiConfidenceScore: Double?,
    val submittedAt: Instant,
    val createdAt: Instant
)

fun Result.toResponse() = ResultResponse(
    id = id!!,
    examId = examId,
    studentId = studentId,
    score = score,
    maxScore = maxScore,
    percentage = if (maxScore > 0) (score / maxScore) * 100 else 0.0,
    aiConfidenceScore = aiConfidenceScore,
    submittedAt = submittedAt,
    createdAt = createdAt
)
