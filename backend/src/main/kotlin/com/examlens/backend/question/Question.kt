package com.examlens.backend.question

import com.examlens.backend.common.BaseEntity
import jakarta.persistence.*

@Entity
@Table(name = "questions")
class Question(
    @Column(nullable = false)
    var examId: String,

    @Column(nullable = false, length = 1000)
    var question: String,

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "question_options", joinColumns = [JoinColumn(name = "question_id")])
    @Column(name = "option_text")
    var options: MutableList<String> = mutableListOf(),

    @Column(nullable = false)
    var correctOption: Int = 0,

    @Column(nullable = false)
    var marks: Int = 5
) : BaseEntity()
