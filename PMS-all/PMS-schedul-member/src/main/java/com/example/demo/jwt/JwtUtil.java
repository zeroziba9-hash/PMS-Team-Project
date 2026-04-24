package com.example.demo.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtUtil {

    private final SecretKey secretKey;

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /** 토큰 파싱 & 서명 검증 — 만료/위조 시 예외 발생 */
    public Claims validateToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** 토큰에서 userId 추출 */
    public Integer getUserId(String token) {
        return Integer.valueOf(validateToken(token).getSubject());
    }

    /** 토큰에서 loginId 추출 */
    public String getLoginId(String token) {
        return validateToken(token).get("loginId", String.class);
    }
}
