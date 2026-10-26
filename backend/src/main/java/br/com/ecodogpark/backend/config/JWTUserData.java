package br.com.ecodogpark.backend.config;

import lombok.Builder;

@Builder
public record JWTUserData(Long userId, String roles) {
}
