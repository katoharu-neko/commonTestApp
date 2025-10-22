package com.example.commonTestApp.service;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.commonTestApp.dto.LoginRequest;
import com.example.commonTestApp.dto.RegisterRequest;
import com.example.commonTestApp.dto.TokenResponse;
import com.example.commonTestApp.dto.VerifyResponse;
import com.example.commonTestApp.entity.Role;
import com.example.commonTestApp.entity.User;
import com.example.commonTestApp.entity.VerificationToken;
import com.example.commonTestApp.repository.RoleRepository;
import com.example.commonTestApp.repository.UserRepository;
import com.example.commonTestApp.repository.VerificationTokenRepository;
import com.example.commonTestApp.security.JwtUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final VerificationTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final MailService mailService; // ← MailServiceに委譲する
    // private final AppLinkBuilder linkBuilder; // ← B案では不要なので削除

    // 24時間
    private static final long TOKEN_TTL_MILLIS = 24L * 60 * 60 * 1000;

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
            role = roleRepository.findById(2)
                    .orElseThrow(() -> new RuntimeException("ロール初期化未完了"));
        }

        // ユーザー作成
        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setVerified(false);
        user.setRole(role);
        userRepository.save(user);

        // トークン新規発行
        VerificationToken vt = new VerificationToken();
        vt.setToken(UUID.randomUUID().toString());
        vt.setUser(user);
        vt.setExpiresAt(new Date(System.currentTimeMillis() + TOKEN_TTL_MILLIS));
        tokenRepository.save(vt);

        // ★B案：URLの作成はMailService側に委譲（APIリンク /api/auth/verify?token=...）
        mailService.sendEmailVerification(user.getEmail(), vt.getToken());

        log.info("register: userId={}, email={}", user.getId(), user.getEmail());
    }

    /**
     * 冪等なメール検証。
     * - 無効/期限切れ → エラーコード返却（期限切れはトークン削除）
     * - 未認証ユーザー → 有効化 & トークン削除
     * - 既に認証済み → ALREADY_VERIFIED
     */
    @Transactional
    public VerifyResponse verify(String token) {
        if (token == null || token.isBlank()) {
            return new VerifyResponse("TOKEN_INVALID", "トークンが指定されていません");
        }

        Optional<VerificationToken> opt = tokenRepository.findByToken(token);
        if (opt.isEmpty()) {
            log.info("verify: token not found (maybe already consumed). token={}", token);
            return new VerifyResponse("ALREADY_VERIFIED", "すでに認証は完了しています");
        }

        VerificationToken vt = opt.get();
        Date now = new Date();
        Date exp = vt.getExpiresAt();
        if (exp != null && exp.before(now)) {
            tokenRepository.delete(vt); // 期限切れを掃除
            return new VerifyResponse("TOKEN_EXPIRED", "トークンの有効期限が切れています。再度登録をお試しください。");
        }

        User user = vt.getUser();
        if (user == null) {
            tokenRepository.delete(vt); // 孤児トークン掃除
            return new VerifyResponse("TOKEN_INVALID", "無効なトークンです。");
        }

        if (Boolean.TRUE.equals(user.getVerified())) {
            tokenRepository.delete(vt); // 再利用防止で掃除
            return new VerifyResponse("ALREADY_VERIFIED", "すでに認証は完了しています");
        }

        // 有効化
        user.setVerified(true);
        userRepository.save(user);

        // 再利用防止：トークンを削除
        tokenRepository.delete(vt);

        return new VerifyResponse("VERIFIED", "メール認証が完了しました。ログインできます。");
    }

    /** コントローラ互換のための別名。内部的には verify(...) に委譲。 */
    @Transactional
    public VerifyResponse verifyEmail(String token) {
        return verify(token);
    }
}
