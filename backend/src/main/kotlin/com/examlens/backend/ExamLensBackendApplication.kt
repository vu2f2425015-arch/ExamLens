package com.examlens.backend

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class ExamLensBackendApplication

fun main(args: Array<String>) {
    runApplication<ExamLensBackendApplication>(*args)
}
