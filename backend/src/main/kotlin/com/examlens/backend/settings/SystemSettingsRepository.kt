package com.examlens.backend.settings

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface SystemSettingsRepository : JpaRepository<SystemSettings, Long>
