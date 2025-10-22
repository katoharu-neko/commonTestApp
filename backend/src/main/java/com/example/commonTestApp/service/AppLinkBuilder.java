// backend/src/main/java/com/example/commonTestApp/service/AppLinkBuilder.java
package com.example.commonTestApp.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * メール内に記載する URL を一元生成するヘルパ。
 *
 * B案:
 * - メールに入れるリンクは「バックエンドの検証API」を指す
 *   例) https://<your-app>.herokuapp.com/api/auth/verify?token=...
 * - バックエンド側が検証後、結果に応じてフロントの
 *     /verify-email/success または /verify-email/failed へ 302 リダイレクトする
 *
 * PUBLIC_BASE_URL を必須ベースとして使い、足りない場合のみローカルの既定値にフォールバック。
 */
@Component
public class AppLinkBuilder {

    private final String publicBaseUrl;   // 公開URL (Herokuの https://<app>.herokuapp.com を想定)
    private final String frontendBaseUrl; // フロントのベース (例: http://localhost:3000)
    private final String backendBaseUrl;  // バックのベース (例: http://localhost:8080) ※B案では基本未使用

    public AppLinkBuilder(
        @Value("${app.publicBaseUrl:http://localhost:8080}") String publicBaseUrl,
        @Value("${app.frontendBaseUrl:http://localhost:3000}") String frontendBaseUrl,
        @Value("${app.backendBaseUrl:http://localhost:8080}") String backendBaseUrl
    ) {
        this.publicBaseUrl = trimTailSlash(publicBaseUrl);
        this.frontendBaseUrl = trimTailSlash(frontendBaseUrl);
        this.backendBaseUrl = trimTailSlash(backendBaseUrl);
    }

    private String trimTailSlash(String s) {
        if (s == null) return null;
        return s.endsWith("/") ? s.substring(0, s.length() - 1) : s;
    }

    /**
     * AuthService から呼ばれる公開メソッド。
     * B案では「バックエンド検証API」を返す。
     */
    public String buildVerifyLink(String token) {
        return buildEmailVerifyApiLink(token);
    }

    /** メール認証リンク（バックエンドの検証APIを叩くリンク） */
    public String buildEmailVerifyApiLink(String token) {
        String t = token == null ? "" : URLEncoder.encode(token, StandardCharsets.UTF_8);
        // Heroku 本番では app.publicBaseUrl を https://<your-app>.herokuapp.com に設定しておくこと
        return publicBaseUrl + "/api/auth/verify?token=" + t;
    }

    /** 検証成功時に遷移させるフロントのURL（バックエンドのリダイレクト先） */
    public String buildEmailVerifySuccessPage() {
        return frontendBaseUrl + "/verify-email/success";
    }

    /** 検証失敗時に遷移させるフロントのURL（バックエンドのリダイレクト先） */
    public String buildEmailVerifyFailedPage() {
        return frontendBaseUrl + "/verify-email/failed";
    }
}
