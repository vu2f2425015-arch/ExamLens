package com.examlens.backend.student

import com.examlens.backend.common.BaseEntity
import jakarta.persistence.*

@Entity
@Table(name = "students")
class Student(
    @Column(nullable = false, unique = true)
    var rollNumber: String,

    @Column(nullable = false)
    var fullName: String,

    @Column(nullable = false, unique = true)
    var officialEmail: String,

    @Column(nullable = false)
    var department: String = "",

    var semester: Int = 1,

    var gpa: Double = 0.0,

    var passcodeHash: String? = null,

    @Column(nullable = false)
    var isActivated: Boolean = false
) : BaseEntity()
