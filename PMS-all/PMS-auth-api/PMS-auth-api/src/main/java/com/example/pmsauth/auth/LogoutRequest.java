package com.example.pmsauth.auth;

import jakarta.validation.constraints.NotBlank;

public record LogoutRequest(
        @NotBlank String token
) {
}
