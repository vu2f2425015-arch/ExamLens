package com.examlens.backend.recording

import java.util.UUID

data class RecordingDto(
    val id: UUID?,
    val studentId: String,
    val studentName: String,
    val examId: String,
    val examName: String,
    val alert: String,
    val severity: String,
    val duration: String,
    val size: String,
    val videoUrl: String,
    val timestamp: String
)

data class CreateRecordingRequest(
    val studentId: String,
    val studentName: String,
    val examId: String,
    val examName: String,
    val alert: String,
    val severity: String = "warning",
    val duration: String = "0:35",
    val size: String = "12.4 MB",
    val videoUrl: String = ""
)
