package com.example.commonTestApp.service;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class MailService {

    @Value("${sendgrid.apiKey:}")
    private String sendgridApiKey;

    @Value("${app.mail.from:no-reply@example.com}")
    private String fromAddress;

    /**
     * 外向きの公開URL（Heroku では PUBLIC_BASE_URL で上書き）
     * 例: https://<your-app>.herokuapp.com
     */
    @Value("${app.publicBaseUrl:http://localhost:8080}")
    private String publicBaseUrl;

    /**
     * ユーザーのメールアドレス確認用メールを送る。
     * token を URL に埋め込み、バックエンドの検証APIへ誘導します。
     */
    public void sendVerificationEmail(String to, String token) {
        final String verifyUrl = buildVerifyUrl(token);
        final String subject = "メールアドレスの確認";
        final String body =
            "以下のリンクをクリックしてメール認証を完了してください。\n" +
            verifyUrl + "\n\n" +
            "このリンクには有効期限がある場合があります。お早めにお手続きください。";

        sendPlainText(to, subject, body);
    }

    /**
     * 検証用URLを生成（APIへ直リンク）
     * 例: https://<app>/api/auth/verify-email?token=xxxx
     */
    private String buildVerifyUrl(String token) {
        String base = publicBaseUrl;
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        String encoded = URLEncoder.encode(token, StandardCharsets.UTF_8);
        return base + "/api/auth/verify-email?token=" + encoded;
    }

    /**
     * プレーンテキストメール送信。
     * sendgrid.apiKey が未設定の場合は、送信せずにログへ本文を出力します（開発用）。
     */
    public void sendPlainText(String to, String subject, String content) {
        if (sendgridApiKey == null || sendgridApiKey.isBlank()) {
            log.warn("[DEV] sendgrid.apiKey 未設定。メールは送信せずログ出力のみ。");
            log.info("=== MAIL (DEV) ===\nTO: {}\nSUBJECT: {}\n{}\n==================", to, subject, content);
            return;
        }

        try {
            Email from = new Email(fromAddress);
            Email toEmail = new Email(to);
            Content body = new Content("text/plain", content);
            Mail mail = new Mail(from, subject, toEmail, body);

            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            SendGrid sg = new SendGrid(sendgridApiKey);
            Response response = sg.api(request);

            if (response.getStatusCode() >= 400) {
                log.error("SendGrid error: {} {}", response.getStatusCode(), response.getBody());
            }
        } catch (IOException ex) {
            log.error("SendGrid exception", ex);
        }
    }
}
