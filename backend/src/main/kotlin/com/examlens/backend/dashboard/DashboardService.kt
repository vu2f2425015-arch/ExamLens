package com.examlens.backend.dashboard

import com.examlens.backend.alert.AlertService
import com.examlens.backend.alert.AlertStatus
import com.examlens.backend.exam.ExamService
import com.examlens.backend.exam.ExamStatus
import com.examlens.backend.result.ResultService
import com.examlens.backend.student.StudentService
import org.springframework.stereotype.Service

@Service
class DashboardService(
    private val studentService: StudentService,
    private val examService: ExamService,
    private val alertService: AlertService,
    private val resultService: ResultService
) {
    fun getMetrics(): DashboardMetrics {
        return DashboardMetrics(
            totalCandidates = studentService.count(),
            scheduledExams = examService.countByStatus(ExamStatus.SCHEDULED),
            activeExams = examService.countByStatus(ExamStatus.ACTIVE),
            concludedExams = examService.countByStatus(ExamStatus.CONCLUDED),
            totalAlerts = alertService.count(),
            pendingAlerts = alertService.countByStatus(AlertStatus.PENDING),
            resolvedAlerts = alertService.countByStatus(AlertStatus.RESOLVED),
            avgAiConfidence = resultService.averageAiConfidence()
        )
    }
}
