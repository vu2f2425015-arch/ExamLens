package com.examlens.backend.recording

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface RecordingRepository : JpaRepository<Recording, UUID> {
    fun findByExamId(examId: String): List<Recording>
    fun findByStudentId(studentId: String): List<Recording>
    fun findBySeverity(severity: String): List<Recording>
}
