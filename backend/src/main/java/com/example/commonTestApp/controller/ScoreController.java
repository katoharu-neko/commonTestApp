package com.example.commonTestApp.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.commonTestApp.entity.Score;
import com.example.commonTestApp.entity.User;
import com.example.commonTestApp.repository.ScoreRepository;
import com.example.commonTestApp.repository.UserRepository;
import com.example.commonTestApp.service.ScoreService;

@RestController
@RequestMapping("/api/scores")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:8080" }, allowCredentials = "true")
public class ScoreController {

    private final ScoreService scoreService;
    private final UserRepository userRepository;
    private final ScoreRepository scoreRepository;

    public ScoreController(
            ScoreService scoreService,
            UserRepository userRepository,
            ScoreRepository scoreRepository) {
        this.scoreService = scoreService;
        this.userRepository = userRepository;
        this.scoreRepository = scoreRepository;
    }

    /**
     * スコア登録（ログイン中ユーザーに紐づけ）
     */
    @PostMapping
    public ResponseEntity<Score> registerScore(
            @RequestBody Score score,
            @AuthenticationPrincipal String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません"));

        score.setUserId(user.getId());
        Score saved = scoreRepository.save(score);
        return ResponseEntity.ok(saved);
    }

    /**
     * 自分の全スコア（ログイン中ユーザー）
     * /api/scores/me
     */
    @GetMapping("/me")
    public ResponseEntity<List<Score>> getMyScores(@AuthenticationPrincipal String email) {
        User me = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません"));
        List<Score> list = scoreService.findByUserId(me.getId());
        return ResponseEntity.ok(list);
    }

    /**
     * 特定ユーザーのスコア一覧（管理・確認用）
     */
    @GetMapping("/user/{userId}")
    public List<Score> getUserScores(@PathVariable Long userId) {
        return scoreService.findByUserId(userId);
    }

    /**
     * 年度指定でスコア取得（管理・確認用）
     */
    @GetMapping("/user/{userId}/year/{year}")
    public List<Score> getUserScoresByYear(@PathVariable Long userId, @PathVariable Integer year) {
        return scoreService.findByUserIdAndYear(userId, year);
    }

    /**
     * 全スコア取得（確認用）
     */
    @GetMapping
    public List<Score> getAllScores() {
        return scoreService.findAll();
    }
}
