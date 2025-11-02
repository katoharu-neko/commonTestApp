package com.example.commonTestApp.controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

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
import com.example.commonTestApp.entity.Subject;
import com.example.commonTestApp.entity.User;
import com.example.commonTestApp.repository.ScoreRepository;
import com.example.commonTestApp.repository.SubjectRepository;
import com.example.commonTestApp.repository.UserRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/scores")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoreRepository scoreRepository;
    private final SubjectRepository subjectRepository;
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

        @NotNull(message = "科目IDは必須です")
        private Integer subjectId;

        @NotNull(message = "得点は必須です")
        @Min(value = 0, message = "得点は0以上")
        @Max(value = 10000, message = "得点が大きすぎます")
        private Integer score;

        @NotNull(message = "年度は必須です")
        private Integer year;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Integer getSubjectId() { return subjectId; }
        public void setSubjectId(Integer subjectId) { this.subjectId = subjectId; }
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
    public List<ScoreResponse> getAllScores(Authentication auth) {
        if (!hasRole(auth, "ROLE_ADMIN")) {
            throw new ForbiddenException("管理者のみ閲覧できます。");
        }
        return toScoreResponses(scoreRepository.findAll());
    }

    /**
     * 自分のスコア一覧（ログイン必須）
     */
    @GetMapping("/me")
    public List<ScoreResponse> getMyScores(Principal principal) {
        User me = requireLoginUser(principal);
        return toScoreResponses(scoreRepository.findByUserId(me.getId()));
    }

    /**
     * ユーザー別スコア（ADMIN/EDUCATOR は任意ユーザー、GENERAL は自分のみ）
     */
    @GetMapping("/user/{userId}")
    public List<ScoreResponse> getUserScores(@PathVariable Long userId, Principal principal, Authentication auth) {
        User me = requireLoginUser(principal);
        assertCanViewUser(auth, userId, me.getId());
        return toScoreResponses(scoreRepository.findByUserId(userId));
    }

    /**
     * ユーザー別 + 年度絞り（権限ルールは上と同じ）
     */
    @GetMapping("/user/{userId}/year/{year}")
    public List<ScoreResponse> getUserScoresByYear(@PathVariable Long userId,
                                                   @PathVariable Integer year,
                                                   Principal principal,
                                                   Authentication auth) {
        User me = requireLoginUser(principal);
        assertCanViewUser(auth, userId, me.getId());
        validateYear(year);
        return toScoreResponses(scoreRepository.findByUserIdAndYear(userId, year));
    }

    /**
     * スコア登録
     * GENERAL: 自分宛のみ
     * EDUCATOR/ADMIN: 任意ユーザー宛OK
     */
    @PostMapping
    public ResponseEntity<ScoreResponse> registerScore(@Valid @RequestBody CreateScoreRequest req,
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

        // 科目の存在確認
        Subject subject = subjectRepository.findById(req.getSubjectId())
                .orElseThrow(() -> new BadRequestException("指定された科目が存在しません。"));

        // ここではシンプルに Score を保存（科目はIDで保持、得点は素点）
        Score s = new Score();
        s.setUserId(targetUser.getId());
        s.setSubjectId(subject.getId());
        s.setScore(req.getScore());
        s.setYear(req.getYear());
        // createdAt はエンティティ側の @PrePersist などで自動付与しているなら省略

        Score saved = scoreRepository.save(s);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ScoreResponse.from(saved, subject));
    }

    private Map<Integer, Subject> loadSubjects(List<Score> scores) {
        if (scores == null || scores.isEmpty()) {
            return Collections.emptyMap();
        }
        Set<Integer> ids = new HashSet<>();
        for (Score score : scores) {
            if (score != null && score.getSubjectId() != null) {
                ids.add(score.getSubjectId());
            }
        }
        if (ids.isEmpty()) {
            return Collections.emptyMap();
        }
        Map<Integer, Subject> map = new HashMap<>();
        for (Subject subject : subjectRepository.findAllById(ids)) {
            if (subject != null && subject.getId() != null) {
                map.put(subject.getId(), subject);
            }
        }
        return map;
    }

    private List<ScoreResponse> toScoreResponses(List<Score> scores) {
        if (scores == null || scores.isEmpty()) {
            return Collections.emptyList();
        }
        Map<Integer, Subject> subjectMap = loadSubjects(scores);
        List<ScoreResponse> responses = new ArrayList<>(scores.size());
        for (Score score : scores) {
            Subject subject = subjectMap.get(score.getSubjectId());
            responses.add(ScoreResponse.from(score, subject));
        }
        return responses;
    }

    public static class ScoreResponse {
        private Long id;
        private Long userId;
        private Integer subjectId;
        private String subject;
        private Integer score;
        private Integer year;
        private LocalDateTime createdAt;

        static ScoreResponse from(Score score, Subject subject) {
            ScoreResponse response = new ScoreResponse();
            response.setId(score.getId());
            response.setUserId(score.getUserId());
            response.setSubjectId(score.getSubjectId());
            response.setSubject(subject != null ? subject.getName() : null);
            response.setScore(score.getScore());
            response.setYear(score.getYear());
            response.setCreatedAt(score.getCreatedAt());
            return response;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Integer getSubjectId() { return subjectId; }
        public void setSubjectId(Integer subjectId) { this.subjectId = subjectId; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public Integer getScore() { return score; }
        public void setScore(Integer score) { this.score = score; }
        public Integer getYear() { return year; }
        public void setYear(Integer year) { this.year = year; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
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
