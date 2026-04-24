package com.example.pmsauth.auth;

public record LoginResponse(Integer userId, String name, String token, String message) {
}
