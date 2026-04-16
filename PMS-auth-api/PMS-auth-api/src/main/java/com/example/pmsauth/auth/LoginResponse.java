package com.example.pmsauth.auth;

public record LoginResponse(Long userId, String name, String token, String message) {
}
