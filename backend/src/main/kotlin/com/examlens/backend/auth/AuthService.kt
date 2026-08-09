package com.examlens.backend.auth

import com.examlens.backend.common.ConflictException
import com.examlens.backend.common.ResourceNotFoundException
import com.examlens.backend.student.StudentRepository
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val studentRepository: StudentRepository,
    private val adminUserRepository: AdminUserRepository,
    private val jwtProvider: JwtProvider,
    private val passwordEncoder: PasswordEncoder
) {
    /**
     * Roster activation: verify roll + email match, set passcode, mark activated.
     */
    fun activateStudent(request: StudentActivateRequest): AuthResponse {
        val student = studentRepository.findByRollNumber(request.rollNumber.trim().uppercase())
            ?: throw ResourceNotFoundException("No student found with roll number: ${request.rollNumber}")

        if (student.officialEmail.lowercase() != request.officialEmail.trim().lowercase()) {
            throw BadCredentialsException("Email does not match the roster record for this roll number")
        }

        if (student.isActivated) {
            throw ConflictException("Student account already activated. Please login instead.")
        }

        student.passcodeHash = passwordEncoder.encode(request.passcode)
        student.isActivated = true
        studentRepository.save(student)

        return buildStudentAuthResponse(student)
    }

    /**
     * Student login: roll number + passcode → JWT.
     */
    fun loginStudent(request: StudentLoginRequest): AuthResponse {
        val student = studentRepository.findByRollNumber(request.rollNumber.trim().uppercase())
            ?: throw BadCredentialsException("Invalid roll number or passcode")

        if (!student.isActivated || student.passcodeHash == null) {
            throw BadCredentialsException("Account not activated. Please activate your account first.")
        }

        if (!passwordEncoder.matches(request.passcode, student.passcodeHash)) {
            throw BadCredentialsException("Invalid roll number or passcode")
        }

        return buildStudentAuthResponse(student)
    }

    /**
     * Admin login: email + password → JWT.
     */
    fun loginAdmin(request: AdminLoginRequest): AuthResponse {
        val admin = adminUserRepository.findByEmail(request.email.trim().lowercase())
            ?: throw BadCredentialsException("Invalid email or password")

        if (!passwordEncoder.matches(request.password, admin.passwordHash)) {
            throw BadCredentialsException("Invalid email or password")
        }

        return AuthResponse(
            accessToken = jwtProvider.generateAccessToken(admin.id!!, admin.role.name, admin.fullName),
            refreshToken = jwtProvider.generateRefreshToken(admin.id!!, admin.role.name, admin.fullName),
            expiresIn = jwtProvider.getAccessTokenExpirySeconds(),
            role = admin.role.name,
            userId = admin.id!!,
            displayName = admin.fullName
        )
    }

    /**
     * Refresh: validate refresh token → new access token.
     */
    fun refreshToken(request: RefreshTokenRequest): AuthResponse {
        if (!jwtProvider.validateToken(request.refreshToken)) {
            throw BadCredentialsException("Invalid or expired refresh token")
        }

        val tokenType = jwtProvider.getTokenTypeFromToken(request.refreshToken)
        if (tokenType != "refresh") {
            throw BadCredentialsException("Provided token is not a refresh token")
        }

        val userId = jwtProvider.getUserIdFromToken(request.refreshToken)
        val role = jwtProvider.getRoleFromToken(request.refreshToken)
        val displayName = jwtProvider.getDisplayNameFromToken(request.refreshToken)

        return AuthResponse(
            accessToken = jwtProvider.generateAccessToken(userId, role, displayName),
            refreshToken = jwtProvider.generateRefreshToken(userId, role, displayName),
            expiresIn = jwtProvider.getAccessTokenExpirySeconds(),
            role = role,
            userId = userId,
            displayName = displayName
        )
    }

    private fun buildStudentAuthResponse(student: com.examlens.backend.student.Student): AuthResponse {
        return AuthResponse(
            accessToken = jwtProvider.generateAccessToken(student.id!!, "STUDENT", student.fullName),
            refreshToken = jwtProvider.generateRefreshToken(student.id!!, "STUDENT", student.fullName),
            expiresIn = jwtProvider.getAccessTokenExpirySeconds(),
            role = "STUDENT",
            userId = student.id!!,
            displayName = student.fullName
        )
    }

    fun updateProfile(request: UpdateProfileRequest): MessageResponse {
        // Admin or fallback update
        val admin = adminUserRepository.findAll().firstOrNull()
        if (admin != null) {
            request.fullName?.let { if (it.isNotBlank()) admin.fullName = it }
            request.email?.let { if (it.isNotBlank()) admin.email = it }
            adminUserRepository.save(admin)
        }
        return MessageResponse("Profile updated successfully")
    }

    fun changePassword(request: ChangePasswordRequest): MessageResponse {
        val admin = adminUserRepository.findAll().firstOrNull()
            ?: throw ResourceNotFoundException("User record not found")
        if (!passwordEncoder.matches(request.currentPassword, admin.passwordHash)) {
            throw BadCredentialsException("Current password does not match")
        }
        admin.passwordHash = passwordEncoder.encode(request.newPassword)
        adminUserRepository.save(admin)
        return MessageResponse("Password updated successfully")
    }
}
