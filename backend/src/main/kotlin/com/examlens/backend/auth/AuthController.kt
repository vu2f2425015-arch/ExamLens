package com.examlens.backend.auth

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Student & Admin authentication endpoints")
class AuthController(
    private val authService: AuthService
) {
    @PostMapping("/student/activate")
    @Operation(summary = "Activate student account", description = "Verify roster record by roll number + email, set passcode, mark activated")
    fun activateStudent(@Valid @RequestBody request: StudentActivateRequest): ResponseEntity<AuthResponse> =
        ResponseEntity.ok(authService.activateStudent(request))

    @PostMapping("/student/login")
    @Operation(summary = "Student login", description = "Authenticate with roll number and passcode")
    fun loginStudent(@Valid @RequestBody request: StudentLoginRequest): ResponseEntity<AuthResponse> =
        ResponseEntity.ok(authService.loginStudent(request))

    @PostMapping("/admin/login")
    @Operation(summary = "Admin login", description = "Authenticate with email and password")
    fun loginAdmin(@Valid @RequestBody request: AdminLoginRequest): ResponseEntity<AuthResponse> =
        ResponseEntity.ok(authService.loginAdmin(request))

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Exchange refresh token for new access + refresh tokens")
    fun refreshToken(@Valid @RequestBody request: RefreshTokenRequest): ResponseEntity<AuthResponse> =
        ResponseEntity.ok(authService.refreshToken(request))

    @PutMapping("/profile")
    @Operation(summary = "Update user profile", description = "Update full name, email, or department")
    fun updateProfile(@RequestBody request: UpdateProfileRequest): ResponseEntity<MessageResponse> =
        ResponseEntity.ok(authService.updateProfile(request))

    @PutMapping("/change-password")
    @Operation(summary = "Change user password", description = "Verify current password and update to new password")
    fun changePassword(@RequestBody request: ChangePasswordRequest): ResponseEntity<MessageResponse> =
        ResponseEntity.ok(authService.changePassword(request))
}
