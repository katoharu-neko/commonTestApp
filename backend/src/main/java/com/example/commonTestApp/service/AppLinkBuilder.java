package com.example.commonTestApp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AppLinkBuilder {

    @Value("${app.publicBaseUrl}")
    private String backendBase;

    @Value("${app.frontendUrl}")
    private String frontendUrl;

    public String buildVerifyUrl(String token) {
        // バックエンドの検証APIへ直接
        return backendBase + "/api/auth/verify?token=" + token;
    }

    public String buildFrontendVerifyResultUrl(String status) {
        return frontendUrl + "/verify-result?status=" + status;
    }
}
