package com.examlens.backend.result

import com.examlens.backend.auth.UserPrincipal
import com.examlens.backend.common.ResourceNotFoundException
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class ResultService(
    private val resultRepository: ResultRepository
) {
    fun getAll(examId: UUID?, studentId: UUID?): List<ResultResponse> {
        val results = when {
            examId != null && studentId != null -> resultRepository.findByExamIdAndStudentId(examId, studentId)
            examId != null -> resultRepository.findByExamId(examId)
            studentId != null -> resultRepository.findByStudentId(studentId)
            else -> resultRepository.findAll()
        }
        return results.map { it.toResponse() }
    }

    /**
     * Get results for a specific student (self-access: ownership enforced in controller).
     */
    fun getByStudentId(studentId: UUID, principal: UserPrincipal): List<ResultResponse> {
        // Students can only access their own results
        if (principal.role == "STUDENT" && principal.userId != studentId) {
            throw AccessDeniedException("You can only view your own results")
        }
        return resultRepository.findByStudentId(studentId).map { it.toResponse() }
    }

    fun create(request: CreateResultRequest): ResultResponse {
        val result = Result(
            examId = request.examId,
            studentId = request.studentId,
            score = request.score,
            maxScore = request.maxScore,
            aiConfidenceScore = request.aiConfidenceScore
        )
        return resultRepository.save(result).toResponse()
    }

    fun averageAiConfidence(): Double = resultRepository.averageAiConfidence() ?: 100.0
}
