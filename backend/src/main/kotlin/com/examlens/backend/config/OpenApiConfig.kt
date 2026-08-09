package com.examlens.backend.config

import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Contact
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class OpenApiConfig {

    @Bean
    fun customOpenApi(): OpenAPI = OpenAPI()
        .info(
            Info()
                .title("ExamLens Backend API")
                .version("1.0.0")
                .description(
                    "RESTful API for ExamLens — University Examination & Automated Proctoring Portal. " +
                    "Manages students, exams, results, AI proctoring alerts, and dashboard telemetry."
                )
                .contact(
                    Contact()
                        .name("ExamLens Team")
                        .email("admin@examlens.edu")
                )
        )
        .addSecurityItem(SecurityRequirement().addList("bearerAuth"))
        .components(
            Components()
                .addSecuritySchemes(
                    "bearerAuth",
                    SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Enter your JWT access token")
                )
        )
}
