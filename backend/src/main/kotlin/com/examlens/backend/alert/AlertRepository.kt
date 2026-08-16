package com.examlens.backend.alert

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface AlertRepository : JpaRepository<Alert, UUID> {
    fun findByExamId(examId: UUID): List<Alert>
    fun findByStudentId(studentId: UUID): List<Alert>
    fun findByStatus(status: AlertStatus): List<Alert>
    fun findByExamIdAndStatus(examId: UUID, status: AlertStatus): List<Alert>
    fun countByStatus(status: AlertStatus): Long
}
