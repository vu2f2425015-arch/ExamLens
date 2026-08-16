package com.examlens.backend.question

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api")
@Tag(name = "Question & Exam Attempt API", description = "Endpoints for managing exam question banks and submitting exam answer sheets")
class QuestionController(
    private val questionService: QuestionService
) {

    @GetMapping("/questions/exam/{examId}")
    @Operation(summary = "Get all questions for a specific exam")
    fun getQuestionsByExam(@PathVariable examId: String): ResponseEntity<List<QuestionDto>> {
        return ResponseEntity.ok(questionService.getQuestionsByExam(examId))
    }

    @PostMapping("/questions")
    @Operation(summary = "Create a new exam question")
    fun createQuestion(@RequestBody req: CreateQuestionRequest): ResponseEntity<QuestionDto> {
        return ResponseEntity.ok(questionService.createQuestion(req))
    }

    @PutMapping("/questions/{id}")
    @Operation(summary = "Update an existing question")
    fun updateQuestion(
        @PathVariable id: UUID,
        @RequestBody req: CreateQuestionRequest
    ): ResponseEntity<QuestionDto> {
        return ResponseEntity.ok(questionService.updateQuestion(id, req))
    }

    @DeleteMapping("/questions/{id}")
    @Operation(summary = "Delete a question")
    fun deleteQuestion(@PathVariable id: UUID): ResponseEntity<Void> {
        questionService.deleteQuestion(id)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/exams/{id}/submit")
    @Operation(summary = "Submit exam answers, calculate grade/score, and record result")
    fun submitExam(
        @PathVariable id: String,
        @RequestBody req: ExamSubmissionRequest
    ): ResponseEntity<SubmissionResultDto> {
        return ResponseEntity.ok(questionService.submitExam(id, req))
    }
}
