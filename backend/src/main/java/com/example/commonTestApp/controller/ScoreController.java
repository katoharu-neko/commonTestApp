package com.example.commonTestApp.controller;

import java.security.Principal;
import java.time.Year;
import java.util.List;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.commonTestApp.entity.Score;
import com.example.commonTestApp.entity.User;
import com.example.commonTestApp.repository.ScoreRepository;
import com.example.commonTestApp.repository.UserRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/scores")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoreRepository scoreRepository;
    private final UserRepository userRepository;

    // ====== ヘルパー ======

    private boolean hasRole(Authentication auth, String role) {
        if (auth == null) return false;
        for (GrantedAuthority ga : auth.getAuthorities()) {
            if (role.equals(ga.getAuthority())) return true;
        }
        return false;
    }

    private User requireLoginUser(Principal principal) {
        if (principal == null || !StringUtils.hasText(principal.getName())) {
            throw new ForbiddenException("未認証です。");
        }
        String email = principal.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ForbiddenException("ユーザーが見つかりません。"));
    }

    private void assertCanViewUser(Authentication auth, Long targetUserId, Long selfUserId) {
        if (Objects.equals(targetUserId, selfUserId)) return; // 自分のは常にOK
        if (hasRole(auth, "ROLE_ADMIN")) return;
        if (hasRole(auth, "ROLE_EDUCATOR")) return;
        throw new ForbiddenException("このユーザーのスコアを参照する権限がありません。");
    }

    private void assertCanCreateForUser(Authentication auth, Long targetUserId, Long selfUserId) {
        if (Objects.equals(targetUserId, selfUserId)) return; // 自分宛はOK
        if (hasRole(auth, "ROLE_ADMIN")) return;
        if (hasRole(auth, "ROLE_EDUCATOR")) return;
        throw new ForbiddenException("このユーザーにスコアを登録する権限がありません。");
    }

    private void validateYear(Integer year) {
        int thisYear = Year.now().getValue();
        if (year < 1900 || year > thisYear + 1) {
            throw new BadRequestException("年度が不正です。");
        }
    }

    // ====== DTO ======

    public static class CreateScoreRequest {
        /**
         * 省略時はログイン中のユーザーIDに補完します。
         * GENERAL は自分以外を指定できません。
         */
        private Long userId;

        @NotBlank(message = "科目は必須です")
        private String subject;

        @NotNull(message = "得点は必須です")
        @Min(value = 0, message = "得点は0以上")
        @Max(value = 10000, message = "得点が大きすぎます")
        private Integer score;

        @NotNull(message = "年度は必須です")
        private Integer year;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public Integer getScore() { return score; }
        public void setScore(Integer score) { this.score = score; }
        public Integer getYear() { return year; }
        public void setYear(Integer year) { this.year = year; }
    }

    // ====== API ======

    /**
     * スコア一覧（管理者のみ）
     */
    @GetMapping
    public List<Score> getAllScores(Authentication auth) {
        if (!hasRole(auth, "ROLE_ADMIN")) {
            throw new ForbiddenException("管理者のみ閲覧できます。");
        }
        return scoreRepository.findAll();
    }

    /**
     * 自分のスコア一覧（ログイン必須）
     */
    @GetMapping("/me")
    public List<Score> getMyScores(Principal principal) {
        User me = requireLoginUser(principal);
        return scoreRepository.findByUserId(me.getId());
    }

    /**
     * ユーザー別スコア（ADMIN/EDUCATOR は任意ユーザー、GENERAL は自分のみ）
     */
    @GetMapping("/user/{userId}")
    public List<Score> getUserScores(@PathVariable Long userId, Principal principal, Authentication auth) {
        User me = requireLoginUser(principal);
        assertCanViewUser(auth, userId, me.getId());
        return scoreRepository.findByUserId(userId);
    }

    /**
     * ユーザー別 + 年度絞り（権限ルールは上と同じ）
     */
    @GetMapping("/user/{userId}/year/{year}")
    public List<Score> getUserScoresByYear(@PathVariable Long userId,
                                           @PathVariable Integer year,
                                           Principal principal,
                                           Authentication auth) {
        User me = requireLoginUser(principal);
        assertCanViewUser(auth, userId, me.getId());
        validateYear(year);
        return scoreRepository.findByUserIdAndYear(userId, year);
    }

    /**
     * スコア登録
     * GENERAL: 自分宛のみ
     * EDUCATOR/ADMIN: 任意ユーザー宛OK
     */
    @PostMapping
    public ResponseEntity<Score> registerScore(@Valid @RequestBody CreateScoreRequest req,
                                               Principal principal,
                                               Authentication auth) {
        User me = requireLoginUser(principal);

        Long targetUserId = (req.getUserId() != null) ? req.getUserId() : me.getId();
        // ユーザー存在確認
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new BadRequestException("対象ユーザーが存在しません。"));

        // 権限チェック
        assertCanCreateForUser(auth, targetUserId, me.getId());

        // 年度チェック
        validateYear(req.getYear());

        // ここではシンプルに Score を保存（科目は文字列、得点は素点）
        Score s = new Score();
        s.setUserId(targetUser.getId());
        s.setSubject(req.getSubject().trim());
        s.setScore(req.getScore());
        s.setYear(req.getYear());
        // createdAt はエンティティ側の @PrePersist などで自動付与しているなら省略

        Score saved = scoreRepository.save(s);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ====== 例外ハンドリング（簡易） ======

    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ExceptionHandler(ForbiddenException.class)
    public String handleForbidden(ForbiddenException ex) {
        return ex.getMessage();
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(BadRequestException.class)
    public String handleBadRequest(BadRequestException ex) {
        return ex.getMessage();
    }

    // ====== 簡易例外クラス ======
    static class ForbiddenException extends RuntimeException {
        ForbiddenException(String m) { super(m); }
    }
    static class BadRequestException extends RuntimeException {
        BadRequestException(String m) { super(m); }
    }
}
