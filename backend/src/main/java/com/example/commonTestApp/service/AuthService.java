package com.example.commonTestApp.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.commonTestApp.entity.User;
import com.example.commonTestApp.repository.UserRepository;
import com.example.commonTestApp.security.JwtUtil;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    // ✅ ログイン処理
    public String login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("ユーザーが存在しません"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("パスワードが違います");
        }

        return jwtUtil.generateToken(email);
    }

    // ✅ 新規登録処理
    public String register(String name, String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("このメールアドレスはすでに登録されています");
        }

        User newUser = new User();
        newUser.setName(name);
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(password));
        userRepository.save(newUser);

        return jwtUtil.generateToken(email); // 登録後すぐトークンを返す
    }
}
