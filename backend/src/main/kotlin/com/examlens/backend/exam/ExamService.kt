package com.examlens.backend.exam

import com.examlens.backend.common.ResourceNotFoundException
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class ExamService(
    private val examRepository: ExamRepository
) {
    fun getAll(): List<ExamResponse> =
        examRepository.findAll().map { it.toResponse() }

    fun getById(id: UUID): ExamResponse {
        val exam = examRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Exam not found with ID: $id") }
        return exam.toResponse()
    }

    fun create(request: CreateExamRequest): ExamResponse {
        val exam = Exam(
            title = request.title.trim(),
            subjectCode = request.subjectCode.trim(),
            faculty = request.faculty.trim(),
            scheduledStart = request.scheduledStart,
            scheduledEnd = request.scheduledEnd,
            durationMinutes = request.durationMinutes,
            totalMarks = request.totalMarks,
            passingMarks = request.passingMarks,
            totalQuestions = request.totalQuestions,
            enrolledStudents = request.enrolledStudents,
            description = request.description.trim()
        )
        return examRepository.save(exam).toResponse()
    }

    fun update(id: UUID, request: UpdateExamRequest): ExamResponse {
        val exam = examRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Exam not found with ID: $id") }

        request.title?.let { exam.title = it.trim() }
        request.subjectCode?.let { exam.subjectCode = it.trim() }
        request.faculty?.let { exam.faculty = it.trim() }
        request.scheduledStart?.let { exam.scheduledStart = it }
        request.scheduledEnd?.let { exam.scheduledEnd = it }
        request.durationMinutes?.let { exam.durationMinutes = it }
        request.status?.let { exam.status = it }
        request.totalMarks?.let { exam.totalMarks = it }
        request.passingMarks?.let { exam.passingMarks = it }
        request.totalQuestions?.let { exam.totalQuestions = it }
        request.enrolledStudents?.let { exam.enrolledStudents = it }
        request.description?.let { exam.description = it.trim() }

        return examRepository.save(exam).toResponse()
    }

    fun delete(id: UUID) {
        if (!examRepository.existsById(id)) {
            throw ResourceNotFoundException("Exam not found with ID: $id")
        }
        examRepository.deleteById(id)
    }

    fun count(): Long = examRepository.count()
    fun countByStatus(status: ExamStatus): Long = examRepository.countByStatus(status)
}
