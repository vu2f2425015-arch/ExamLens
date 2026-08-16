package com.examlens.backend.exam

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ExamRepository : JpaRepository<Exam, UUID> {
    fun findByStatus(status: ExamStatus): List<Exam>
    fun countByStatus(status: ExamStatus): Long
}
