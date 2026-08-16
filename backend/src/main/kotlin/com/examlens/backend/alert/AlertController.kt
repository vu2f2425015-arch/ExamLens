package com.examlens.backend.alert

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/alerts")
@Tag(name = "Alerts", description = "AI proctoring violation logs")
class AlertController(
    private val alertService: AlertService
) {
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROCTOR')")
    @Operation(summary = "List alerts", description = "Filterable by examId and/or status")
    fun getAll(
        @RequestParam(required = false) examId: UUID?,
        @RequestParam(required = false) status: AlertStatus?
    ): ResponseEntity<List<AlertResponse>> =
        ResponseEntity.ok(alertService.getAll(examId, status))

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROCTOR')")
    @Operation(summary = "Log a new proctoring alert")
    fun create(@Valid @RequestBody request: CreateAlertRequest): ResponseEntity<AlertResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(alertService.create(request))

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROCTOR')")
    @Operation(summary = "Update alert status", description = "Mark alert as RESOLVED or PENDING")
    fun updateStatus(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateAlertStatusRequest
    ): ResponseEntity<AlertResponse> =
        ResponseEntity.ok(alertService.updateStatus(id, request))
}
