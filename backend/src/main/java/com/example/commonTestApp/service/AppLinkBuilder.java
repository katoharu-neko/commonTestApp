package com.example.commonTestApp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AppLinkBuilder {

    @Value("${app.backendBaseUrl}")
    private String backendBaseUrl;

    /** バックエンドの検証APIへのURLを作る（Heroku移行時はこのベースを差し替え） */
    public String buildVerifyLink(String token) {
        return backendBaseUrl + "/api/auth/verify?token=" + token;
    }
}
