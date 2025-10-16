package com.example.commonTestApp.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.commonTestApp.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ✅ JSONボディで受け取るように変更
    @PostMapping("/login")
    public String login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        return authService.login(email, password);
    }

    @PostMapping("/register")
    public String register(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");
        return authService.register(name, email, password);
    }
}
