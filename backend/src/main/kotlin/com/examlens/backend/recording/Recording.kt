package com.examlens.backend.recording

import com.examlens.backend.common.BaseEntity
import jakarta.persistence.*

@Entity
@Table(name = "recordings")
class Recording(
    @Column(nullable = false)
    var studentId: String,

    @Column(nullable = false)
    var studentName: String,

    @Column(nullable = false)
    var examId: String,

    @Column(nullable = false)
    var examName: String,

    @Column(nullable = false)
    var alert: String, // e.g. "Multiple Faces Detected"

    @Column(nullable = false)
    var severity: String = "warning", // "low", "warning", "danger", "critical"

    var duration: String = "0:35",

    var size: String = "12.4 MB",

    var videoUrl: String = "",

    var timestamp: String = ""
) : BaseEntity()
