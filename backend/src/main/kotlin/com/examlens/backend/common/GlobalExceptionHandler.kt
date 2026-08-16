package com.examlens.backend.common

import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleNotFound(ex: ResourceNotFoundException, req: HttpServletRequest): ResponseEntity<ApiErrorResponse> =
        buildResponse(HttpStatus.NOT_FOUND, ex.message ?: "Resource not found", req)

    @ExceptionHandler(ConflictException::class)
    fun handleConflict(ex: ConflictException, req: HttpServletRequest): ResponseEntity<ApiErrorResponse> =
        buildResponse(HttpStatus.CONFLICT, ex.message ?: "Resource conflict", req)

    @ExceptionHandler(BadCredentialsException::class)
    fun handleBadCredentials(ex: BadCredentialsException, req: HttpServletRequest): ResponseEntity<ApiErrorResponse> =
        buildResponse(HttpStatus.UNAUTHORIZED, ex.message ?: "Invalid credentials", req)

    @ExceptionHandler(AccessDeniedException::class)
    fun handleAccessDenied(ex: AccessDeniedException, req: HttpServletRequest): ResponseEntity<ApiErrorResponse> =
        buildResponse(HttpStatus.FORBIDDEN, ex.message ?: "Access denied", req)

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(ex: MethodArgumentNotValidException, req: HttpServletRequest): ResponseEntity<ApiErrorResponse> {
        val errors = ex.bindingResult.fieldErrors.joinToString("; ") { "${it.field}: ${it.defaultMessage}" }
        return buildResponse(HttpStatus.BAD_REQUEST, errors, req)
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleBadRequest(ex: IllegalArgumentException, req: HttpServletRequest): ResponseEntity<ApiErrorResponse> =
        buildResponse(HttpStatus.BAD_REQUEST, ex.message ?: "Bad request", req)

    @ExceptionHandler(Exception::class)
    fun handleGeneric(ex: Exception, req: HttpServletRequest): ResponseEntity<ApiErrorResponse> =
        buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, ex.message ?: "Internal server error", req)

    private fun buildResponse(status: HttpStatus, message: String, req: HttpServletRequest): ResponseEntity<ApiErrorResponse> =
        ResponseEntity.status(status).body(
            ApiErrorResponse(
                status = status.value(),
                error = status.reasonPhrase,
                message = message,
                path = req.requestURI
            )
        )
}

class ResourceNotFoundException(message: String) : RuntimeException(message)
class ConflictException(message: String) : RuntimeException(message)
