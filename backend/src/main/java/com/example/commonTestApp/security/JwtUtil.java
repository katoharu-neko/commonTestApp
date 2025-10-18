// backend/src/main/java/com/example/commonTestApp/security/JwtUtil.java
package com.example.commonTestApp.security;

import java.util.Base64;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    private final SecretKey key;
    private final long expirationMs;

    public JwtUtil(
            @Value("${jwt.secret:}") String base64Secret,
            @Value("${jwt.expiration-ms:0}") long expirationMs) {

        if (!StringUtils.hasText(base64Secret)) {
            throw new IllegalStateException("jwt.secret が未設定です。application.yml に設定してください。");
        }
        if (expirationMs <= 0) {
            throw new IllegalStateException("jwt.expiration-ms が未設定/不正です。正の数で設定してください。");
        }

        byte[] bytes = Base64.getDecoder().decode(base64Secret);
        this.key = Keys.hmacShaKeyFor(bytes);
        this.expirationMs = expirationMs;
    }

    public String generateToken(String email) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expirationMs))
                .signWith(key)
                .compact();
    }

    public String getSubject(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject();
        } catch (Exception e) {
            return null;
        }
    }
}
