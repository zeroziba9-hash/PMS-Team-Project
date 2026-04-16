package com.example.pmsauth.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<Map<String, String>> handleAuthException(AuthException e) {
        HttpStatus status = e.getMessage().contains("이미 사용") ? HttpStatus.CONFLICT : HttpStatus.UNAUTHORIZED;
        return ResponseEntity.status(status).body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(MethodArgumentNotValidException e) {
        return ResponseEntity.badRequest().body(Map.of("message", "입력값을 확인해주세요."));
    }
}
