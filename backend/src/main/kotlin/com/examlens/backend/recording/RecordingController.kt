package com.examlens.backend.recording

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/recordings")
@Tag(name = "Anomaly Video Vault API", description = "Endpoints for managing recorded 30-40s anomaly proctoring video clips")
class RecordingController(
    private val recordingService: RecordingService
) {

    @GetMapping
    @Operation(summary = "Get all anomaly recordings with optional filtering by exam, severity, or student")
    fun getAllRecordings(
        @RequestParam(required = false) examId: String?,
        @RequestParam(required = false) severity: String?,
        @RequestParam(required = false) studentId: String?
    ): ResponseEntity<List<RecordingDto>> {
        return ResponseEntity.ok(recordingService.getAllRecordings(examId, severity, studentId))
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single recording by ID")
    fun getRecordingById(@PathVariable id: UUID): ResponseEntity<RecordingDto> {
        return ResponseEntity.ok(recordingService.getRecordingById(id))
    }

    @PostMapping
    @Operation(summary = "Log and save a new anomaly video clip into vault")
    fun createRecording(@RequestBody req: CreateRecordingRequest): ResponseEntity<RecordingDto> {
        return ResponseEntity.ok(recordingService.createRecording(req))
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an anomaly video clip from vault")
    fun deleteRecording(@PathVariable id: UUID): ResponseEntity<Void> {
        recordingService.deleteRecording(id)
        return ResponseEntity.noContent().build()
    }
}
