package com.examlens.backend.dashboard

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Admin dashboard telemetry")
class DashboardController(
    private val dashboardService: DashboardService
) {
    @GetMapping("/metrics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROCTOR')")
    @Operation(summary = "Get dashboard metrics", description = "Aggregated counts for candidates, exams, alerts, and AI confidence")
    fun getMetrics(): ResponseEntity<DashboardMetrics> =
        ResponseEntity.ok(dashboardService.getMetrics())
}
