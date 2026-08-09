package com.examlens.backend.alert

import com.examlens.backend.common.BaseEntity
import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

enum class AlertType {
    FACE_LOST, MULTIPLE_FACES, TAB_SWITCH, NOISE_DETECTED, PHONE_DETECTED, CAMERA_DISABLED
}

enum class AlertStatus {
    PENDING, RESOLVED
}

@Entity
@Table(name = "alerts")
class Alert(
    @Column(nullable = false)
    var examId: UUID,

    @Column(nullable = false)
    var studentId: UUID,

    var studentName: String = "",

    var examName: String = "",

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var type: AlertType,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: AlertStatus = AlertStatus.PENDING,

    var confidenceScore: Double? = null,

    var severity: String = "warning",

    @Column(columnDefinition = "TEXT")
    var notes: String = "",

    @Column(nullable = false)
    var timestamp: Instant = Instant.now()
) : BaseEntity()
