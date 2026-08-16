package com.examlens.backend.auth

import com.examlens.backend.student.Student
import com.examlens.backend.student.StudentRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired lateinit var mockMvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper
    @Autowired lateinit var studentRepository: StudentRepository
    @Autowired lateinit var adminUserRepository: AdminUserRepository
    @Autowired lateinit var passwordEncoder: PasswordEncoder

    @BeforeEach
    fun setup() {
        studentRepository.deleteAll()
        // DataSeeder handles admin creation on boot, so admin should already exist
    }

    @Test
    fun `admin login with valid credentials returns JWT`() {
        mockMvc.perform(
            post("/api/auth/admin/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(AdminLoginRequest("admin@examlens.edu", "admin123")))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.accessToken").isNotEmpty)
            .andExpect(jsonPath("$.refreshToken").isNotEmpty)
            .andExpect(jsonPath("$.role").value("ADMIN"))
    }

    @Test
    fun `admin login with wrong password returns 401`() {
        mockMvc.perform(
            post("/api/auth/admin/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(AdminLoginRequest("admin@examlens.edu", "wrong")))
        )
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `student activation with valid roster record returns JWT`() {
        // Seed a student in the roster
        studentRepository.save(
            Student(
                rollNumber = "TEST001",
                fullName = "Test Student",
                officialEmail = "test@examlens.edu",
                department = "Computer Science",
                semester = 5,
                gpa = 8.5
            )
        )

        mockMvc.perform(
            post("/api/auth/student/activate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                    StudentActivateRequest("TEST001", "test@examlens.edu", "student123")
                ))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.accessToken").isNotEmpty)
            .andExpect(jsonPath("$.role").value("STUDENT"))
    }

    @Test
    fun `student activation with wrong email returns 401`() {
        studentRepository.save(
            Student(
                rollNumber = "TEST002",
                fullName = "Test Student 2",
                officialEmail = "test2@examlens.edu",
                department = "Electronics",
                semester = 3
            )
        )

        mockMvc.perform(
            post("/api/auth/student/activate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                    StudentActivateRequest("TEST002", "wrong@examlens.edu", "student123")
                ))
        )
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `student login after activation works`() {
        // Create and activate a student
        val student = Student(
            rollNumber = "TEST003",
            fullName = "Test Student 3",
            officialEmail = "test3@examlens.edu",
            department = "Mechanical",
            semester = 4,
            passcodeHash = passwordEncoder.encode("mypass123"),
            isActivated = true
        )
        studentRepository.save(student)

        mockMvc.perform(
            post("/api/auth/student/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                    StudentLoginRequest("TEST003", "mypass123")
                ))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.accessToken").isNotEmpty)
            .andExpect(jsonPath("$.role").value("STUDENT"))
    }

    @Test
    fun `refresh token returns new access token`() {
        // First login to get a refresh token
        val loginResult = mockMvc.perform(
            post("/api/auth/admin/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(AdminLoginRequest("admin@examlens.edu", "admin123")))
        )
            .andExpect(status().isOk)
            .andReturn()

        val response = objectMapper.readTree(loginResult.response.contentAsString)
        val refreshToken = response["refreshToken"].asText()

        mockMvc.perform(
            post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(RefreshTokenRequest(refreshToken)))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.accessToken").isNotEmpty)
    }
}
