package br.com.ecodogpark.backend.config;

import lombok.Builder;

import java.util.UUID;

@Builder
public record JWTUserData(UUID userId, String roles) {
}
