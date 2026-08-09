package com.examlens.backend.alert

import com.examlens.backend.common.ResourceNotFoundException
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AlertService(
    private val alertRepository: AlertRepository
) {
    fun getAll(examId: UUID?, status: AlertStatus?): List<AlertResponse> {
        val alerts = when {
            examId != null && status != null -> alertRepository.findByExamIdAndStatus(examId, status)
            examId != null -> alertRepository.findByExamId(examId)
            status != null -> alertRepository.findByStatus(status)
            else -> alertRepository.findAll()
        }
        return alerts.map { it.toResponse() }
    }

    fun create(request: CreateAlertRequest): AlertResponse {
        val alert = Alert(
            examId = request.examId,
            studentId = request.studentId,
            studentName = request.studentName,
            examName = request.examName,
            type = request.type,
            confidenceScore = request.confidenceScore,
            severity = request.severity,
            notes = request.notes
        )
        return alertRepository.save(alert).toResponse()
    }

    fun updateStatus(id: UUID, request: UpdateAlertStatusRequest): AlertResponse {
        val alert = alertRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Alert not found with ID: $id") }
        alert.status = request.status
        return alertRepository.save(alert).toResponse()
    }

    fun countByStatus(status: AlertStatus): Long = alertRepository.countByStatus(status)
    fun count(): Long = alertRepository.count()
}
