// backend/src/main/java/com/example/commonTestApp/controller/AuthController.java
package com.example.commonTestApp.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.commonTestApp.dto.LoginRequest;
import com.example.commonTestApp.dto.RegisterRequest;
import com.example.commonTestApp.dto.TokenResponse;
import com.example.commonTestApp.dto.VerifyResponse;
import com.example.commonTestApp.service.AppLinkBuilder;
import com.example.commonTestApp.service.AuthService;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AppLinkBuilder appLinkBuilder;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody RegisterRequest req) {
        // 登録＆検証メール送付（AuthService 側でトークン作成・保存・メール送信）
        authService.register(req);
        // 既存フロントが 200/空ボディ想定なのでそれに合わせる
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest req) {
        TokenResponse token = authService.login(req);
        return ResponseEntity.ok(token);
    }

    /**
     * B案: メールに記載されたリンクがここに来る。
     * 検証成功: フロント /verify-email/success へ 302
     * 検証失敗: フロント /verify-email/failed  へ 302
     */
    @GetMapping("/verify")
    public void verifyEmail(@RequestParam("token") String token, HttpServletResponse res) {
        VerifyResponse result = authService.verify(token); // ← AuthService のメソッド名に合わせる
        boolean ok = "VERIFIED".equals(result.getCode()) || "ALREADY_VERIFIED".equals(result.getCode());

        res.setStatus(HttpServletResponse.SC_FOUND); // 302
        res.setHeader("Location", ok
                ? appLinkBuilder.buildEmailVerifySuccessPage()
                : appLinkBuilder.buildEmailVerifyFailedPage());
    }

    /** JSON で結果が欲しい場合のエンドポイント（任意） */
    @GetMapping("/verify/json")
    public ResponseEntity<VerifyResponse> verifyEmailJson(@RequestParam("token") String token) {
        VerifyResponse result = authService.verify(token); // ← 同上
        boolean ok = "VERIFIED".equals(result.getCode()) || "ALREADY_VERIFIED".equals(result.getCode());
        return new ResponseEntity<>(result, ok ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
    }
}
