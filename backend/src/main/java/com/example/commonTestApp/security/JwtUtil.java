package com.example.commonTestApp.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    // application.yml で設定: jwt.secret は Base64 で
    @Value("${jwt.secret:ZmFrZV9zZWNyZXRfMzJieXRlc19iYXNlNjQ=}")
    private String secretBase64;

    @Value("${jwt.expiration-ms:2592000000}") // 30日
    private long expirationMs;

    private SecretKey key() {
        byte[] decoded = Decoders.BASE64.decode(secretBase64);
        return Keys.hmacShaKeyFor(decoded);
    }

    public String generateToken(String subjectEmail) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .setSubject(subjectEmail)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }
}
