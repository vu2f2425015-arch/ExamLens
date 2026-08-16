package com.examlens.backend.student

import com.examlens.backend.common.ConflictException
import com.examlens.backend.common.PageResponse
import com.examlens.backend.common.ResourceNotFoundException
import org.apache.commons.csv.CSVFormat
import org.apache.commons.csv.CSVParser
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.io.InputStreamReader
import java.util.UUID

@Service
class StudentService(
    private val studentRepository: StudentRepository
) {
    fun getAll(page: Int, size: Int, department: String?, semester: Int?): PageResponse<StudentResponse> {
        val pageable = PageRequest.of(page, size, Sort.by("createdAt").descending())
        val result = studentRepository.findFiltered(department, semester, pageable)
        return PageResponse(
            content = result.content.map { it.toResponse() },
            page = result.number,
            size = result.size,
            totalElements = result.totalElements,
            totalPages = result.totalPages,
            isLast = result.isLast
        )
    }

    fun getById(id: UUID): StudentResponse {
        val student = studentRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Student not found with ID: $id") }
        return student.toResponse()
    }

    fun getByRollNumber(rollNumber: String): StudentResponse? {
        val student = studentRepository.findByRollNumber(rollNumber.trim().uppercase())
            ?: return null
        return student.toResponse()
    }

    fun create(request: CreateStudentRequest): StudentResponse {
        val rollNumber = request.rollNumber.trim().uppercase()

        if (studentRepository.existsByRollNumber(rollNumber)) {
            throw ConflictException("Student with roll number $rollNumber already exists")
        }
        if (studentRepository.existsByOfficialEmail(request.officialEmail.trim().lowercase())) {
            throw ConflictException("Student with email ${request.officialEmail} already exists")
        }

        val student = Student(
            rollNumber = rollNumber,
            fullName = request.fullName.trim(),
            officialEmail = request.officialEmail.trim().lowercase(),
            department = request.department.trim(),
            semester = request.semester,
            gpa = request.gpa
        )
        return studentRepository.save(student).toResponse()
    }

    fun update(id: UUID, request: UpdateStudentRequest): StudentResponse {
        val student = studentRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Student not found with ID: $id") }

        request.fullName?.let { student.fullName = it.trim() }
        request.department?.let { student.department = it.trim() }
        request.semester?.let { student.semester = it }
        request.gpa?.let { student.gpa = it }

        return studentRepository.save(student).toResponse()
    }

    fun delete(id: UUID) {
        if (!studentRepository.existsById(id)) {
            throw ResourceNotFoundException("Student not found with ID: $id")
        }
        studentRepository.deleteById(id)
    }

    /**
     * CSV bulk import. Expected format:
     * rollNumber,name,email,department,semester,gpa
     */
    fun importCsv(file: MultipartFile): ImportResult {
        val reader = InputStreamReader(file.inputStream)
        val csvFormat = CSVFormat.DEFAULT.builder()
            .setHeader()
            .setIgnoreHeaderCase(true)
            .setTrim(true)
            .setSkipHeaderRecord(true)
            .build()
        val parser = CSVParser(reader, csvFormat)

        var imported = 0
        var skipped = 0
        val errors = mutableListOf<String>()

        for (record in parser) {
            try {
                val rollNumber = (record.get("rollNumber") ?: record.get("roll_number") ?: "").trim().uppercase()
                val name = (record.get("name") ?: record.get("fullName") ?: record.get("full_name") ?: "").trim()
                val email = (record.get("email") ?: record.get("officialEmail") ?: record.get("official_email") ?: "").trim().lowercase()
                val department = (record.get("department") ?: "").trim()
                val semester = try { (record.get("semester") ?: "1").trim().toInt() } catch (e: Exception) { 1 }
                val gpa = try { (record.get("gpa") ?: "0.0").trim().toDouble() } catch (e: Exception) { 0.0 }

                if (rollNumber.isBlank() || name.isBlank() || email.isBlank()) {
                    skipped++
                    errors.add("Row ${record.recordNumber}: Missing required fields (rollNumber, name, email)")
                    continue
                }

                if (studentRepository.existsByRollNumber(rollNumber)) {
                    skipped++
                    errors.add("Row ${record.recordNumber}: Roll number $rollNumber already exists")
                    continue
                }

                if (studentRepository.existsByOfficialEmail(email)) {
                    skipped++
                    errors.add("Row ${record.recordNumber}: Email $email already exists")
                    continue
                }

                val student = Student(
                    rollNumber = rollNumber,
                    fullName = name,
                    officialEmail = email,
                    department = department,
                    semester = semester,
                    gpa = gpa
                )
                studentRepository.save(student)
                imported++
            } catch (e: Exception) {
                skipped++
                errors.add("Row ${record.recordNumber}: ${e.message}")
            }
        }

        parser.close()
        return ImportResult(imported = imported, skipped = skipped, errors = errors)
    }

    /**
     * Purge all student records. Admin-only, requires confirmation.
     */
    fun purgeAll(): Long {
        val count = studentRepository.count()
        studentRepository.deleteAll()
        return count
    }

    fun count(): Long = studentRepository.count()
}

data class ImportResult(
    val imported: Int,
    val skipped: Int,
    val errors: List<String>
)
