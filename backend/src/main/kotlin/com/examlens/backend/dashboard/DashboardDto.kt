package com.examlens.backend.dashboard

data class DashboardMetrics(
    val totalCandidates: Long,
    val scheduledExams: Long,
    val activeExams: Long,
    val concludedExams: Long,
    val totalAlerts: Long,
    val pendingAlerts: Long,
    val resolvedAlerts: Long,
    val avgAiConfidence: Double
)
