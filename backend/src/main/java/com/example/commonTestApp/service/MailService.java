package com.example.commonTestApp.service;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email; // ← これが正しい Email

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class MailService {

    @Value("${sendgrid.apiKey:}")
    private String sendgridApiKey;

    @Value("${app.mail.from}")
    private String fromAddress;

    // 宛先にアノテーションでバリデーションをかけたい場合は↓のように FQCN を使う
    // public void sendPlainText(@jakarta.validation.constraints.Email String to, String subject, String content) {
    public void sendPlainText(String to, String subject, String content) {
        if (sendgridApiKey == null || sendgridApiKey.isBlank()) {
            // 開発モード：メール送らずログに出す
            log.warn("[DEV] sendgrid.apiKey 未設定。メールは送信せずログ出力のみ。");
            log.info("=== MAIL (DEV) ===\nTO: {}\nSUBJECT: {}\n{}\n==================", to, subject, content);
            return;
        }

        Email from = new Email(fromAddress);
        Email toEmail = new Email(to);
        Content body = new Content("text/plain", content);
        Mail mail = new Mail(from, subject, toEmail, body);

        Request request = new Request();
        try {
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
