package com.example.commonTestApp.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.commonTestApp.entity.User;
import com.example.commonTestApp.repository.UserRepository;
import com.example.commonTestApp.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    // 新規登録 → 直ちにJWT返す
    public String register(String name, String email, String rawPassword) {
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "このメールアドレスは既に登録されています");
        }
        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(rawPassword));
        userRepository.save(u);
        return jwtUtil.generateToken(email);
    }

    // ログイン → JWT返す
    public String login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("ユーザーが存在しません"));
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("パスワードが違います");
        }
        return jwtUtil.generateToken(email);
    }
}
