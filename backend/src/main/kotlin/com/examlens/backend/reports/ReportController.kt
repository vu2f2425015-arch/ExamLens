package com.examlens.backend.reports

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports & Analytics API", description = "Endpoints for platform examination analytics, score distributions, and average pass rates")
class ReportController(
    private val reportService: ReportService
) {

    @GetMapping("/summary")
    @Operation(summary = "Get analytics summary report for institutional dashboard")
    fun getReportSummary(): ResponseEntity<ReportSummaryDto> {
        return ResponseEntity.ok(reportService.getReportSummary())
    }
}
