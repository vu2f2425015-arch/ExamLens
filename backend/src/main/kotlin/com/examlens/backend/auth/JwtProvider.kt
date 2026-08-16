package com.examlens.backend.auth

import io.jsonwebtoken.*
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey

@Component
class JwtProvider(
    @Value("\${jwt.secret}") private val secret: String,
    @Value("\${jwt.access-token-expiry-ms}") private val accessTokenExpiryMs: Long,
    @Value("\${jwt.refresh-token-expiry-ms}") private val refreshTokenExpiryMs: Long
) {
    private val key: SecretKey by lazy {
        Keys.hmacShaKeyFor(secret.toByteArray())
    }

    fun generateAccessToken(userId: UUID, role: String, displayName: String): String =
        buildToken(userId, role, displayName, accessTokenExpiryMs, "access")

    fun generateRefreshToken(userId: UUID, role: String, displayName: String): String =
        buildToken(userId, role, displayName, refreshTokenExpiryMs, "refresh")

    fun getAccessTokenExpirySeconds(): Long = accessTokenExpiryMs / 1000

    fun validateToken(token: String): Boolean {
        return try {
            parseToken(token)
            true
        } catch (e: JwtException) {
            false
        } catch (e: IllegalArgumentException) {
            false
        }
    }

    fun getUserIdFromToken(token: String): UUID =
        UUID.fromString(parseToken(token).payload.subject)

    fun getRoleFromToken(token: String): String =
        parseToken(token).payload["role"] as String

    fun getDisplayNameFromToken(token: String): String =
        parseToken(token).payload["displayName"] as? String ?: ""

    fun getTokenTypeFromToken(token: String): String =
        parseToken(token).payload["type"] as? String ?: "access"

    private fun buildToken(userId: UUID, role: String, displayName: String, expiryMs: Long, type: String): String {
        val now = Date()
        return Jwts.builder()
            .subject(userId.toString())
            .claim("role", role)
            .claim("displayName", displayName)
            .claim("type", type)
            .issuedAt(now)
            .expiration(Date(now.time + expiryMs))
            .signWith(key)
            .compact()
    }

    private fun parseToken(token: String): Jws<Claims> =
        Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
}
