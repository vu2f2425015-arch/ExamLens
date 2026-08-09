package com.examlens.backend.student

import jakarta.validation.constraints.*
import java.time.Instant
import java.util.UUID

// ── Request DTOs ──

data class CreateStudentRequest(
    @field:NotBlank(message = "Roll number is required")
    val rollNumber: String,

    @field:NotBlank(message = "Full name is required")
    val fullName: String,

    @field:NotBlank(message = "Official email is required")
    @field:Email(message = "Must be a valid email")
    val officialEmail: String,

    @field:NotBlank(message = "Department is required")
    val department: String,

    @field:Min(1) @field:Max(8)
    val semester: Int = 1,

    @field:DecimalMin("0.0") @field:DecimalMax("10.0")
    val gpa: Double = 0.0
)

data class UpdateStudentRequest(
    val fullName: String? = null,
    val department: String? = null,

    @field:Min(1) @field:Max(8)
    val semester: Int? = null,

    @field:DecimalMin("0.0") @field:DecimalMax("10.0")
    val gpa: Double? = null
)

// ── Response DTO ──

data class StudentResponse(
    val id: UUID,
    val rollNumber: String,
    val fullName: String,
    val officialEmail: String,
    val department: String,
    val semester: Int,
    val gpa: Double,
    val isActivated: Boolean,
    val createdAt: Instant
)

// ── Mapper ──

fun Student.toResponse() = StudentResponse(
    id = id!!,
    rollNumber = rollNumber,
    fullName = fullName,
    officialEmail = officialEmail,
    department = department,
    semester = semester,
    gpa = gpa,
    isActivated = isActivated,
    createdAt = createdAt
)
