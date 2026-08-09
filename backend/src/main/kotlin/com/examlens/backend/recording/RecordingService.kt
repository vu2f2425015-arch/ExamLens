package com.examlens.backend.recording

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID

@Service
class RecordingService(
    private val recordingRepository: RecordingRepository
) {

    fun getAllRecordings(examId: String?, severity: String?, studentId: String?): List<RecordingDto> {
        val list = when {
            examId != null -> recordingRepository.findByExamId(examId)
            severity != null -> recordingRepository.findBySeverity(severity)
            studentId != null -> recordingRepository.findByStudentId(studentId)
            else -> recordingRepository.findAll()
        }
        return list.map { it.toDto() }
    }

    fun getRecordingById(id: UUID): RecordingDto {
        val rec = recordingRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Recording clip not found: $id") }
        return rec.toDto()
    }

    @Transactional
    fun createRecording(req: CreateRecordingRequest): RecordingDto {
        val rec = Recording(
            studentId = req.studentId,
            studentName = req.studentName,
            examId = req.examId,
            examName = req.examName,
            alert = req.alert,
            severity = req.severity,
            duration = req.duration,
            size = req.size,
            videoUrl = req.videoUrl,
            timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"))
        )
        return recordingRepository.save(rec).toDto()
    }

    @Transactional
    fun deleteRecording(id: UUID) {
        recordingRepository.deleteById(id)
    }

    private fun Recording.toDto() = RecordingDto(
        id = id,
        studentId = studentId,
        studentName = studentName,
        examId = examId,
        examName = examName,
        alert = alert,
        severity = severity,
        duration = duration,
        size = size,
        videoUrl = videoUrl,
        timestamp = if (timestamp.isBlank()) createdAt.toString() else timestamp
    )
}
