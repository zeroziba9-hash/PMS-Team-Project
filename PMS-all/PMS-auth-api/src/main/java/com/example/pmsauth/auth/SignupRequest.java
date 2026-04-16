package com.example.pmsauth.auth;

import jakarta.validation.constraints.NotBlank;

public record SignupRequest(
        @NotBlank String name,
        @NotBlank String loginId,
        @NotBlank String password
) {
}
