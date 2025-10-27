package com.example.commonTestApp.dto;

public record UserProfileResponse(
        Long id,
        String name,
        String email,
        String role,
        Boolean verified
) {
}
