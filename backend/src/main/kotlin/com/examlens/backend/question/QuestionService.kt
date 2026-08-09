package com.examlens.backend.question

import com.examlens.backend.exam.ExamRepository
import com.examlens.backend.result.Result
import com.examlens.backend.result.ResultRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
class QuestionService(
    private val questionRepository: QuestionRepository,
    private val examRepository: ExamRepository,
    private val resultRepository: ResultRepository
) {

    fun getQuestionsByExam(examId: String): List<QuestionDto> {
        return questionRepository.findByExamId(examId).map { it.toDto() }
    }

    @Transactional
    fun createQuestion(req: CreateQuestionRequest): QuestionDto {
        val q = Question(
            examId = req.examId,
            question = req.question,
            options = req.options.toMutableList(),
            correctOption = req.correctOption,
            marks = req.marks
        )
        return questionRepository.save(q).toDto()
    }

    @Transactional
    fun updateQuestion(id: UUID, req: CreateQuestionRequest): QuestionDto {
        val q = questionRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Question not found: $id") }
        q.examId = req.examId
        q.question = req.question
        q.options = req.options.toMutableList()
        q.correctOption = req.correctOption
        q.marks = req.marks
        return questionRepository.save(q).toDto()
    }

    @Transactional
    fun deleteQuestion(id: UUID) {
        questionRepository.deleteById(id)
    }

    @Transactional
    fun submitExam(examIdStr: String, req: ExamSubmissionRequest): SubmissionResultDto {
        val questions = questionRepository.findByExamId(examIdStr)
        var totalScore = 0
        var totalPossibleMarks = 0
        var correctCount = 0
        var wrongCount = 0
        var unattemptedCount = 0

        for (q in questions) {
            totalPossibleMarks += q.marks
            val qIdStr = q.id.toString()
            val selectedOption = req.answers[qIdStr]
            if (selectedOption == null) {
                unattemptedCount++
            } else if (selectedOption == q.correctOption) {
                correctCount++
                totalScore += q.marks
            } else {
                wrongCount++
            }
        }

        if (totalPossibleMarks == 0) {
            totalPossibleMarks = 100
        }

        val percentage = (totalScore.toDouble() / totalPossibleMarks.toDouble()) * 100.0
        val grade = when {
            percentage >= 90 -> "A+"
            percentage >= 80 -> "A"
            percentage >= 70 -> "B+"
            percentage >= 60 -> "B"
            percentage >= 50 -> "C"
            else -> "F"
        }
        val passed = percentage >= 40.0

        // Save result entry
        val examUuid = try { UUID.fromString(examIdStr) } catch (e: Exception) { UUID.randomUUID() }
        val studentUuid = try { UUID.fromString(req.studentId) } catch (e: Exception) { UUID.randomUUID() }

        val res = Result(
            examId = examUuid,
            studentId = studentUuid,
            score = totalScore.toDouble(),
            maxScore = totalPossibleMarks.toDouble(),
            submittedAt = Instant.now()
        )
        val savedRes = resultRepository.save(res)

        return SubmissionResultDto(
            id = savedRes.id.toString(),
            examId = examIdStr,
            studentId = req.studentId,
            score = totalScore,
            totalMarks = totalPossibleMarks,
            percentage = Math.round(percentage * 10.0) / 10.0,
            grade = grade,
            correct = correctCount,
            wrong = wrongCount,
            unattempted = unattemptedCount,
            passed = passed,
            rank = 3,
            timeTaken = req.timeTaken,
            submittedAt = Instant.now().toString()
        )
    }

    private fun Question.toDto() = QuestionDto(
        id = id,
        examId = examId,
        question = question,
        options = options,
        correctOption = correctOption,
        marks = marks
    )
}
