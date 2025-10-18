package com.example.commonTestApp.service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.commonTestApp.dto.LoginRequest;
import com.example.commonTestApp.dto.RegisterRequest;
import com.example.commonTestApp.dto.TokenResponse;
import com.example.commonTestApp.entity.Role;
import com.example.commonTestApp.entity.User;
import com.example.commonTestApp.entity.VerificationToken;
import com.example.commonTestApp.repository.RoleRepository;
import com.example.commonTestApp.repository.UserRepository;
import com.example.commonTestApp.repository.VerificationTokenRepository;
import com.example.commonTestApp.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final VerificationTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final MailService mailService;
    private final AppLinkBuilder linkBuilder;

    @Transactional
    public TokenResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("メールアドレスまたはパスワードが不正です"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("メールアドレスまたはパスワードが不正です");
        }
        if (Boolean.FALSE.equals(user.getVerified())) {
            throw new RuntimeException("メール認証が完了していません。メール内のリンクをクリックしてください。");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new TokenResponse(token);
    }

    @Transactional
    public void register(RegisterRequest req) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new RuntimeException("既に登録済みのメールアドレスです");
        }

        // ロール決定（id優先 → name → デフォルト一般=2）
        Role role;
        if (req.getRoleId() != null) {
            role = roleRepository.findById(req.getRoleId())
                    .orElseThrow(() -> new RuntimeException("不正なロールIDです"));
        } else if (req.getRoleName() != null && !req.getRoleName().isBlank()) {
            role = roleRepository.findByName(req.getRoleName())
                    .orElseThrow(() -> new RuntimeException("不正なロール名です"));
        } else {
            role = roleRepository.findById(2) // ROLE_GENERAL
                    .orElseThrow(() -> new RuntimeException("ロール初期化未完了"));
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setVerified(false);
        user.setRole(role);
        userRepository.save(user);

        // 検証トークン作成（24時間・UTC基準）
        String token = UUID.randomUUID().toString();
        VerificationToken vt = new VerificationToken();
        vt.setToken(token);
        vt.setUser(user);
        vt.setExpiresAt(LocalDateTime.now(ZoneOffset.UTC).plusHours(24));
        tokenRepository.save(vt);

        // 検証メール（開発モードではログにURLが出ます）
        String verifyUrl = linkBuilder.buildVerifyLink(token);
        String body = "以下のリンクをクリックしてメール認証を完了してください。\n" + verifyUrl;
        mailService.sendPlainText(user.getEmail(), "メールアドレスの確認", body);
    }

    @Transactional
    public void verify(String token) {
        VerificationToken vt = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("無効なトークンです"));

        // 期限切れ判定（UTC基準）
        if (vt.getExpiresAt() != null &&
            vt.getExpiresAt().isBefore(LocalDateTime.now(ZoneOffset.UTC))) {
            throw new RuntimeException("トークンの有効期限が切れています");
        }

        User user = vt.getUser();
        user.setVerified(true);
        userRepository.save(user);

        // 一度使ったトークンは無効化（削除）
        tokenRepository.delete(vt);
    }
}
