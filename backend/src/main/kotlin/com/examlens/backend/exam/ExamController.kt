package com.examlens.backend.exam

import com.examlens.backend.auth.MessageResponse
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/exams")
@Tag(name = "Exams", description = "Examination management")
class ExamController(
    private val examService: ExamService
) {
    @GetMapping
    @Operation(summary = "List all exams")
    fun getAll(): ResponseEntity<List<ExamResponse>> =
        ResponseEntity.ok(examService.getAll())

    @GetMapping("/{id}")
    @Operation(summary = "Get exam by ID")
    fun getById(@PathVariable id: UUID): ResponseEntity<ExamResponse> =
        ResponseEntity.ok(examService.getById(id))

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create an exam")
    fun create(@Valid @RequestBody request: CreateExamRequest): ResponseEntity<ExamResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(examService.create(request))

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an exam")
    fun update(@PathVariable id: UUID, @Valid @RequestBody request: UpdateExamRequest): ResponseEntity<ExamResponse> =
        ResponseEntity.ok(examService.update(id, request))

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an exam")
    fun delete(@PathVariable id: UUID): ResponseEntity<MessageResponse> {
        examService.delete(id)
        return ResponseEntity.ok(MessageResponse("Exam deleted successfully"))
    }
}
