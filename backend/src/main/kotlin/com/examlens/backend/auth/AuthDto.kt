package com.examlens.backend.auth

import jakarta.validation.constraints.*
import java.util.UUID

// ── Request DTOs ──

data class StudentActivateRequest(
    @field:NotBlank(message = "Roll number is required")
    val rollNumber: String,

    @field:NotBlank(message = "Official email is required")
    @field:Email(message = "Must be a valid email")
    val officialEmail: String,

    @field:NotBlank(message = "Passcode is required")
    @field:Size(min = 6, message = "Passcode must be at least 6 characters")
    val passcode: String
)

data class StudentLoginRequest(
    @field:NotBlank(message = "Roll number is required")
    val rollNumber: String,

    @field:NotBlank(message = "Passcode is required")
    val passcode: String
)

data class AdminLoginRequest(
    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Must be a valid email")
    val email: String,

    @field:NotBlank(message = "Password is required")
    val password: String
)

data class RefreshTokenRequest(
    @field:NotBlank(message = "Refresh token is required")
    val refreshToken: String
)

data class UpdateProfileRequest(
    val email: String?,
    val fullName: String?,
    val department: String?
)

data class ChangePasswordRequest(
    val currentPassword: String,
    val newPassword: String
)

// ── Response DTOs ──

data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val tokenType: String = "Bearer",
    val expiresIn: Long,
    val role: String,
    val userId: UUID,
    val displayName: String
)

data class MessageResponse(
    val message: String
)
