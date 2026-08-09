package com.examlens.backend.alert

import jakarta.validation.constraints.*
import java.time.Instant
import java.util.UUID

data class CreateAlertRequest(
    @field:NotNull(message = "Exam ID is required")
    val examId: UUID,

    @field:NotNull(message = "Student ID is required")
    val studentId: UUID,

    val studentName: String = "",
    val examName: String = "",

    @field:NotNull(message = "Alert type is required")
    val type: AlertType,

    val confidenceScore: Double? = null,
    val severity: String = "warning",
    val notes: String = ""
)

data class UpdateAlertStatusRequest(
    @field:NotNull(message = "Status is required")
    val status: AlertStatus
)

data class AlertResponse(
    val id: UUID,
    val examId: UUID,
    val studentId: UUID,
    val studentName: String,
    val examName: String,
    val type: AlertType,
    val status: AlertStatus,
    val confidenceScore: Double?,
    val severity: String,
    val notes: String,
    val timestamp: Instant,
    val createdAt: Instant
)

fun Alert.toResponse() = AlertResponse(
    id = id!!,
    examId = examId,
    studentId = studentId,
    studentName = studentName,
    examName = examName,
    type = type,
    status = status,
    confidenceScore = confidenceScore,
    severity = severity,
    notes = notes,
    timestamp = timestamp,
    createdAt = createdAt
)
