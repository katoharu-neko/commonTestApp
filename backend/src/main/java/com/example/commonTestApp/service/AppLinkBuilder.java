package com.example.commonTestApp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class AppLinkBuilder {

    private final String frontendBaseUrl;
    private final String backendBaseUrl;

    public AppLinkBuilder(
            @Value("${app.frontendBaseUrl:}") String frontendBaseUrl,
            @Value("${app.backendBaseUrl:http://localhost:8080}") String backendBaseUrl // デフォルト用意
    ) {
        if (!StringUtils.hasText(frontendBaseUrl)) {
            throw new IllegalStateException(
                "app.frontendBaseUrl が未設定です。application.yml に app.frontendBaseUrl を設定してください。"
            );
        }
        this.frontendBaseUrl = trimTrailingSlash(frontendBaseUrl);
        this.backendBaseUrl = trimTrailingSlash(backendBaseUrl);
    }

    private String trimTrailingSlash(String url) {
        return url != null && url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    /** フロントのメール検証ページ（例：/verify-email?token=...）のURLを返す */
    public String buildVerifyLink(String token) {
        return frontendBaseUrl + "/verify-email?token=" + token;
    }

    /** 必要ならバックエンドのAPIリンクを作る時に使う */
    public String buildBackendLink(String path) {
        String p = path.startsWith("/") ? path : "/" + path;
        return backendBaseUrl + p;
    }
}
