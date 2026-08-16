package com.examlens.backend.result

import com.examlens.backend.auth.UserPrincipal
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/results")
@Tag(name = "Results", description = "Exam result management")
class ResultController(
    private val resultService: ResultService
) {
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROCTOR')")
    @Operation(summary = "List results", description = "Filterable by examId and/or studentId")
    fun getAll(
        @RequestParam(required = false) examId: UUID?,
        @RequestParam(required = false) studentId: UUID?
    ): ResponseEntity<List<ResultResponse>> =
        ResponseEntity.ok(resultService.getAll(examId, studentId))

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Get student's results", description = "Students can only access their own results")
    fun getByStudentId(
        @PathVariable studentId: UUID,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<List<ResultResponse>> =
        ResponseEntity.ok(resultService.getByStudentId(studentId, principal))

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROCTOR')")
    @Operation(summary = "Submit/record a result")
    fun create(@Valid @RequestBody request: CreateResultRequest): ResponseEntity<ResultResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(resultService.create(request))
}
