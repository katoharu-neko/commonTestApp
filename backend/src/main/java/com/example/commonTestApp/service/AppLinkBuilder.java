package com.example.commonTestApp.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

/**
 * メール内のURL生成ヘルパ（方式B）。
 *
 * 優先順位：
 *   1) 環境変数 APP_PUBLIC_BASE_URL / APP_FRONTEND_BASE_URL / APP_BACKEND_BASE_URL
 *   2) application.yml の app.publicBaseUrl / app.frontendBaseUrl / app.backendBaseUrl
 *   3) デフォルト（localhost）
 *
 * ※ Herokuでは APP_* を config vars に設定しておけば、確実に拾える。
 */
@Component
@Slf4j
public class AppLinkBuilder {

    private final String publicBaseUrl;   // 例: https://<app>.herokuapp.com
    private final String frontendBaseUrl; // 例: https://<app>.herokuapp.com （本番同一オリジン）
    private final String backendBaseUrl;  // 例: https://<app>.herokuapp.com （方式Bでは基本未使用）

    public AppLinkBuilder(
        // 1) 環境変数（最優先）
        @Value("${APP_PUBLIC_BASE_URL:}")  String envPublic,
        @Value("${APP_FRONTEND_BASE_URL:}") String envFrontend,
        @Value("${APP_BACKEND_BASE_URL:}")  String envBackend,
        // 2) application.yml のプロパティ
        @Value("${app.publicBaseUrl:}")    String propPublic,
        @Value("${app.frontendBaseUrl:}")  String propFrontend,
        @Value("${app.backendBaseUrl:}")   String propBackend
    ) {
        this.publicBaseUrl   = trimTailSlash(firstNonBlank(envPublic,   propPublic,   "http://localhost:8080"));
        this.frontendBaseUrl = trimTailSlash(firstNonBlank(envFrontend, propFrontend, this.publicBaseUrl));
        this.backendBaseUrl  = trimTailSlash(firstNonBlank(envBackend,  propBackend,  this.publicBaseUrl));

        // 起動時に実際に使うURLをログ出ししてデバッグ容易に
        log.info("[AppLinkBuilder] publicBaseUrl={}, frontendBaseUrl={}, backendBaseUrl={}",
                this.publicBaseUrl, this.frontendBaseUrl, this.backendBaseUrl);
    }

    private static String firstNonBlank(String a, String b, String def) {
        if (a != null && !a.isBlank()) return a;
        if (b != null && !b.isBlank()) return b;
        return def;
    }

    private static String trimTailSlash(String s) {
        if (s == null) return null;
        return s.endsWith("/") ? s.substring(0, s.length() - 1) : s;
    }

    /** メール認証リンク（バックエンドの検証APIを叩くリンク） */
    public String buildEmailVerifyApiLink(String token) {
        String t = token == null ? "" : URLEncoder.encode(token, StandardCharsets.UTF_8);
        return publicBaseUrl + "/api/auth/verify?token=" + t;
    }

    /** 検証成功時（必要なら使用） */
    public String buildEmailVerifySuccessPage() {
        return frontendBaseUrl + "/verify-email/success";
    }

    /** 検証失敗時（必要なら使用） */
    public String buildEmailVerifyFailedPage() {
        return frontendBaseUrl + "/verify-email/failed";
    }
}
