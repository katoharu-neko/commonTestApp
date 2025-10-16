package com.example.commonTestApp.service;

import org.springframework.stereotype.Service;

import com.example.commonTestApp.entity.User;
import com.example.commonTestApp.repository.UserRepository;
import com.example.commonTestApp.security.JwtUtil;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public String login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("ユーザーが存在しません"));

        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("パスワードが違います");
        }

        return jwtUtil.generateToken(email);
    }
}
