package com.examlens.backend.student

import com.examlens.backend.auth.AdminLoginRequest
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@SpringBootTest
@AutoConfigureMockMvc
class StudentControllerTest {

    @Autowired lateinit var mockMvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper
    @Autowired lateinit var studentRepository: StudentRepository

    private var adminToken: String = ""

    @BeforeEach
    fun setup() {
        studentRepository.deleteAll()
        // Get admin JWT
        val loginResult = mockMvc.perform(
            post("/api/auth/admin/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(AdminLoginRequest("admin@examlens.edu", "admin123")))
        ).andReturn()

        val response = objectMapper.readTree(loginResult.response.contentAsString)
        adminToken = response["accessToken"].asText()
    }

    @Test
    fun `create student returns 201`() {
        mockMvc.perform(
            post("/api/students")
                .header("Authorization", "Bearer $adminToken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                    CreateStudentRequest("CS001", "Aarav Sharma", "aarav@examlens.edu", "Computer Science", 5, 8.8)
                ))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.rollNumber").value("CS001"))
            .andExpect(jsonPath("$.fullName").value("Aarav Sharma"))
            .andExpect(jsonPath("$.isActivated").value(false))
    }

    @Test
    fun `list students returns paginated response`() {
        // Seed some students
        studentRepository.save(Student("STU001", "Student One", "s1@examlens.edu", "CS", 3, 7.5))
        studentRepository.save(Student("STU002", "Student Two", "s2@examlens.edu", "EC", 4, 8.0))

        mockMvc.perform(
            get("/api/students")
                .header("Authorization", "Bearer $adminToken")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content").isArray)
            .andExpect(jsonPath("$.totalElements").value(2))
    }

    @Test
    fun `get student by id returns student`() {
        val student = studentRepository.save(
            Student("STU003", "Student Three", "s3@examlens.edu", "ME", 5, 9.0)
        )

        mockMvc.perform(
            get("/api/students/${student.id}")
                .header("Authorization", "Bearer $adminToken")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.rollNumber").value("STU003"))
    }

    @Test
    fun `update student returns updated data`() {
        val student = studentRepository.save(
            Student("STU004", "Student Four", "s4@examlens.edu", "CS", 3, 7.0)
        )

        mockMvc.perform(
            put("/api/students/${student.id}")
                .header("Authorization", "Bearer $adminToken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                    UpdateStudentRequest(fullName = "Updated Name", semester = 4, gpa = 8.5)
                ))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.fullName").value("Updated Name"))
            .andExpect(jsonPath("$.semester").value(4))
            .andExpect(jsonPath("$.gpa").value(8.5))
    }

    @Test
    fun `delete student returns success`() {
        val student = studentRepository.save(
            Student("STU005", "Student Five", "s5@examlens.edu", "EC", 2, 6.5)
        )

        mockMvc.perform(
            delete("/api/students/${student.id}")
                .header("Authorization", "Bearer $adminToken")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.message").value("Student deleted successfully"))
    }

    @Test
    fun `duplicate roll number returns 409`() {
        studentRepository.save(Student("DUP001", "Original", "orig@examlens.edu", "CS", 1, 7.0))

        mockMvc.perform(
            post("/api/students")
                .header("Authorization", "Bearer $adminToken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                    CreateStudentRequest("DUP001", "Duplicate", "dup@examlens.edu", "CS", 1, 7.0)
                ))
        )
            .andExpect(status().isConflict)
    }

    @Test
    fun `purge without confirmation header returns 400`() {
        mockMvc.perform(
            delete("/api/students/purge")
                .header("Authorization", "Bearer $adminToken")
                .header("X-Confirm-Purge", "false")
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `purge with confirmation deletes all students`() {
        studentRepository.save(Student("P001", "Purge One", "p1@examlens.edu", "CS", 1))
        studentRepository.save(Student("P002", "Purge Two", "p2@examlens.edu", "CS", 2))

        mockMvc.perform(
            delete("/api/students/purge")
                .header("Authorization", "Bearer $adminToken")
                .header("X-Confirm-Purge", "true")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.message").value("Purged 2 student records"))
    }

    @Test
    fun `unauthenticated request returns 403`() {
        mockMvc.perform(get("/api/students"))
            .andExpect(status().isForbidden)
    }
}
