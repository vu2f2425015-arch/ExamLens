package com.examlens.backend.auth

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthFilter(
    private val jwtProvider: JwtProvider
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val token = extractToken(request)

        if (token != null && jwtProvider.validateToken(token)) {
            val tokenType = jwtProvider.getTokenTypeFromToken(token)
            // Only allow access tokens for API requests (not refresh tokens)
            if (tokenType == "access") {
                val userId = jwtProvider.getUserIdFromToken(token)
                val role = jwtProvider.getRoleFromToken(token)
                val displayName = jwtProvider.getDisplayNameFromToken(token)

                val authorities = listOf(SimpleGrantedAuthority("ROLE_$role"))
                val auth = UsernamePasswordAuthenticationToken(
                    UserPrincipal(userId, role, displayName),
                    null,
                    authorities
                )
                SecurityContextHolder.getContext().authentication = auth
            }
        }

        filterChain.doFilter(request, response)
    }

    private fun extractToken(request: HttpServletRequest): String? {
        val header = request.getHeader("Authorization")
        return if (header != null && header.startsWith("Bearer ")) {
            header.substring(7)
        } else null
    }
}

data class UserPrincipal(
    val userId: java.util.UUID,
    val role: String,
    val displayName: String
)
