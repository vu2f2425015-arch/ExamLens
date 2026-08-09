package com.examlens.backend.result

import com.examlens.backend.common.BaseEntity
import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "results")
class Result(
    @Column(nullable = false)
    var examId: UUID,

    @Column(nullable = false)
    var studentId: UUID,

    @Column(nullable = false)
    var score: Double,

    @Column(nullable = false)
    var maxScore: Double = 100.0,

    var aiConfidenceScore: Double? = null,

    @Column(nullable = false)
    var submittedAt: Instant = Instant.now()
) : BaseEntity()
