package com.examlens.backend.auth

import com.examlens.backend.common.BaseEntity
import jakarta.persistence.*

enum class AdminRole {
    ADMIN, PROCTOR
}

@Entity
@Table(name = "admin_users")
class AdminUser(
    @Column(nullable = false, unique = true)
    var email: String,

    @Column(nullable = false)
    var passwordHash: String,

    @Column(nullable = false)
    var fullName: String = "",

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var role: AdminRole = AdminRole.ADMIN
) : BaseEntity()
