package com.examlens.backend.settings

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class SystemSettingsService(
    private val repository: SystemSettingsRepository
) {

    fun getSettings(): SystemSettingsDto {
        val s = repository.findById(1L).orElseGet {
            repository.save(SystemSettings())
        }
        return s.toDto()
    }

    @Transactional
    fun updateSettings(dto: SystemSettingsDto): SystemSettingsDto {
        val s = repository.findById(1L).orElseGet { SystemSettings() }
        s.aiSensitivity = dto.aiSensitivity
        s.faceConfidence = dto.faceConfidence
        s.micThreshold = dto.micThreshold
        s.recordingQuality = dto.recordingQuality
        s.emailNotifications = dto.emailNotifications
        s.alertNotifications = dto.alertNotifications
        return repository.save(s).toDto()
    }

    private fun SystemSettings.toDto() = SystemSettingsDto(
        aiSensitivity = aiSensitivity,
        faceConfidence = faceConfidence,
        micThreshold = micThreshold,
        recordingQuality = recordingQuality,
        emailNotifications = emailNotifications,
        alertNotifications = alertNotifications
    )
}
