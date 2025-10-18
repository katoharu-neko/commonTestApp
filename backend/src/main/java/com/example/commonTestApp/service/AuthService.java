package com.example.commonTestApp.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.commonTestApp.entity.Role;
import com.example.commonTestApp.entity.User;
import com.example.commonTestApp.repository.RoleRepository;
import com.example.commonTestApp.repository.UserRepository;
import com.example.commonTestApp.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    // 新規登録 → 直ちにJWT返す
    public String register(String name, String email, String rawPassword, Integer roleId) {
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "このメールアドレスは既に登録されています");
        }

        // roleId が null/不正なら GENERAL=2 にフォールバック
        int resolved = (roleId == null) ? 2 : roleId.intValue();

        // UIから選べるのは 2 or 3 のみ（ADMINは不可）
        if (resolved != 2 && resolved != 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "選択できるロールは GENERAL か EDUCATOR のみです");
        }

        Role role = roleRepository.findById(resolved)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "ロールが未初期化です"));

        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setRole(role);

        userRepository.save(u);

        return jwtUtil.generateToken(email);
    }

    // ログイン → JWT返す
    public String login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "ユーザーが存在しません"));
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "パスワードが違います");
        }
        return jwtUtil.generateToken(email);
    }
}
