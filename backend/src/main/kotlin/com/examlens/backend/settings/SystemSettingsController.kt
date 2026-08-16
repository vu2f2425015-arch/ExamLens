package com.examlens.backend.settings

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/settings")
@Tag(name = "Platform Settings API", description = "Endpoints for platform AI sensitivity, proctor threshold, and notification configurations")
class SystemSettingsController(
    private val service: SystemSettingsService
) {

    @GetMapping
    @Operation(summary = "Get active platform settings")
    fun getSettings(): ResponseEntity<SystemSettingsDto> {
        return ResponseEntity.ok(service.getSettings())
    }

    @PutMapping
    @Operation(summary = "Update platform settings")
    fun updateSettings(@RequestBody dto: SystemSettingsDto): ResponseEntity<SystemSettingsDto> {
        return ResponseEntity.ok(service.updateSettings(dto))
    }
}
