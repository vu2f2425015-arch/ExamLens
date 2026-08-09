package com.examlens.backend.student

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface StudentRepository : JpaRepository<Student, UUID> {
    fun findByRollNumber(rollNumber: String): Student?
    fun findByOfficialEmail(email: String): Student?
    fun existsByRollNumber(rollNumber: String): Boolean
    fun existsByOfficialEmail(email: String): Boolean

    @Query("SELECT s FROM Student s WHERE " +
           "(:department IS NULL OR s.department = :department) AND " +
           "(:semester IS NULL OR s.semester = :semester)")
    fun findFiltered(department: String?, semester: Int?, pageable: Pageable): Page<Student>
}
