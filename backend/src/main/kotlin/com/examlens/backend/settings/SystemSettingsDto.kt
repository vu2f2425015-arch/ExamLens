package com.examlens.backend.settings

data class SystemSettingsDto(
    val aiSensitivity: String = "medium",
    val faceConfidence: Int = 75,
    val micThreshold: Int = 60,
    val recordingQuality: String = "1080p",
    val emailNotifications: Boolean = true,
    val alertNotifications: Boolean = true
)
