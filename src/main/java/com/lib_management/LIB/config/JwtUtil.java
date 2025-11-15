package com.lib_management.LIB.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key key;
    private final long EXPIRATION_TIME = 1000L * 60 * 60; // 1 hour

    // Spring will inject jwt.secret from application.properties if present
    public JwtUtil(@Value("${jwt.secret:}") String secretProp) {
        String secret = secretProp;

        // fallback to environment variable
        if (secret == null || secret.isBlank()) {
            secret = System.getenv("JWT_SECRET");
        }

        // fallback if neither provided (dev only, never in prod!)
        if (secret == null || secret.length() < 32) {
            secret = "change-me-to-a-long-random-secret-in-prod-32+chars";
        }

        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public String extractRole(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().get("role", String.class);
    }

}
