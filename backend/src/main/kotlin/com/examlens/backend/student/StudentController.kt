package com.examlens.backend.student

import com.examlens.backend.auth.MessageResponse
import com.examlens.backend.common.PageResponse
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

@RestController
@RequestMapping("/api/students")
@Tag(name = "Students", description = "Student roster management")
class StudentController(
    private val studentService: StudentService
) {
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROCTOR')")
    @Operation(summary = "List all students", description = "Paginated list, filterable by department and semester")
    fun getAll(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) department: String?,
        @RequestParam(required = false) semester: Int?
    ): ResponseEntity<PageResponse<StudentResponse>> =
        ResponseEntity.ok(studentService.getAll(page, size, department, semester))

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROCTOR')")
    @Operation(summary = "Get student by ID")
    fun getById(@PathVariable id: UUID): ResponseEntity<StudentResponse> =
        ResponseEntity.ok(studentService.getById(id))

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a student", description = "Add a new student to the roster")
    fun create(@Valid @RequestBody request: CreateStudentRequest): ResponseEntity<StudentResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(studentService.create(request))

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a student")
    fun update(@PathVariable id: UUID, @Valid @RequestBody request: UpdateStudentRequest): ResponseEntity<StudentResponse> =
        ResponseEntity.ok(studentService.update(id, request))

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a student")
    fun delete(@PathVariable id: UUID): ResponseEntity<MessageResponse> {
        studentService.delete(id)
        return ResponseEntity.ok(MessageResponse("Student deleted successfully"))
    }

    @PostMapping("/import", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk import students from CSV", description = "CSV format: rollNumber,name,email,department,semester,gpa")
    fun importCsv(@RequestParam("file") file: MultipartFile): ResponseEntity<ImportResult> =
        ResponseEntity.ok(studentService.importCsv(file))

    @DeleteMapping("/purge")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Purge all students", description = "Requires X-Confirm-Purge: true header")
    fun purge(@RequestHeader("X-Confirm-Purge", required = true) confirm: String): ResponseEntity<MessageResponse> {
        if (confirm != "true") {
            return ResponseEntity.badRequest().body(MessageResponse("Set X-Confirm-Purge header to 'true' to confirm"))
        }
        val count = studentService.purgeAll()
        return ResponseEntity.ok(MessageResponse("Purged $count student records"))
    }
}
