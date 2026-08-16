package com.examlens.backend.result

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface ResultRepository : JpaRepository<Result, UUID> {
    fun findByExamId(examId: UUID): List<Result>
    fun findByStudentId(studentId: UUID): List<Result>
    fun findByExamIdAndStudentId(examId: UUID, studentId: UUID): List<Result>

    @Query("SELECT AVG(r.aiConfidenceScore) FROM Result r WHERE r.aiConfidenceScore IS NOT NULL")
    fun averageAiConfidence(): Double?
}
