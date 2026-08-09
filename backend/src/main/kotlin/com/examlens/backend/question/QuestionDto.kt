package com.examlens.backend.question

import java.util.UUID

data class QuestionDto(
    val id: UUID?,
    val examId: String,
    val question: String,
    val options: List<String>,
    val correctOption: Int,
    val marks: Int
)

data class CreateQuestionRequest(
    val examId: String,
    val question: String,
    val options: List<String>,
    val correctOption: Int,
    val marks: Int
)

data class ExamSubmissionRequest(
    val studentId: String,
    val studentName: String,
    val answers: Map<String, Int>, // questionId -> selectedOptionIndex
    val timeTaken: Int,            // in minutes
    val violationCount: Int = 0
)

data class SubmissionResultDto(
    val id: String,
    val examId: String,
    val studentId: String,
    val score: Int,
    val totalMarks: Int,
    val percentage: Double,
    val grade: String,
    val correct: Int,
    val wrong: Int,
    val unattempted: Int,
    val passed: Boolean,
    val rank: Int,
    val timeTaken: Int,
    val submittedAt: String
)
