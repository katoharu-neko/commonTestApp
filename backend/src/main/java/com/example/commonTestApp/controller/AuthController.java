package com.example.commonTestApp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.commonTestApp.dto.LoginRequest;
import com.example.commonTestApp.dto.RegisterRequest;
import com.example.commonTestApp.dto.TokenResponse;
import com.example.commonTestApp.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000"})
public class AuthController {

    private final AuthService authService;

    @PostMapping(value = "/register", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        authService.register(req);
        return ResponseEntity.ok().body("{\"message\":\"メールを送信しました。届いたリンクから本登録を完了してください。\"}");
    }

    @PostMapping(value = "/login", consumes = "application/json", produces = "application/json")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    /** 開発中はこのURL自体を叩けば検証完了（本番はメール内リンク経由） */
    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam("token") String token) {
        authService.verify(token);
        return ResponseEntity.ok().body("{\"message\":\"メール認証が完了しました。ログインしてください。\"}");
    }
}
