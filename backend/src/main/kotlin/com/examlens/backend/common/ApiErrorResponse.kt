package com.examlens.backend.common

import java.time.Instant

data class ApiErrorResponse(
    val status: Int,
    val error: String,
    val message: String,
    val timestamp: Instant = Instant.now(),
    val path: String? = null
)
