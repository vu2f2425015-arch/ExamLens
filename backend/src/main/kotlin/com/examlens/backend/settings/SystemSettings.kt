package com.examlens.backend.settings

import jakarta.persistence.*

@Entity
@Table(name = "system_settings")
class SystemSettings(
    @Id
    var id: Long = 1L,

    @Column(nullable = false)
    var aiSensitivity: String = "medium", // low, medium, high

    @Column(nullable = false)
    var faceConfidence: Int = 75,

    @Column(nullable = false)
    var micThreshold: Int = 60,

    @Column(nullable = false)
    var recordingQuality: String = "1080p", // 720p, 1080p, 480p

    @Column(nullable = false)
    var emailNotifications: Boolean = true,

    @Column(nullable = false)
    var alertNotifications: Boolean = true
)
