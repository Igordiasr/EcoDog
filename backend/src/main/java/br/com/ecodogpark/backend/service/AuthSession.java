package br.com.ecodogpark.backend.service;

import java.time.LocalDateTime;

public record AuthSession(
        String accessToken,
        String refreshToken,
        LocalDateTime refreshExpiresAt
) {
}
