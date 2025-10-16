package com.example.commonTestApp.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.commonTestApp.entity.Score;
import com.example.commonTestApp.repository.ScoreRepository;

@Service
public class ScoreService {

    private final ScoreRepository scoreRepository;

    public ScoreService(ScoreRepository scoreRepository) {
        this.scoreRepository = scoreRepository;
    }

    // 登録
    public Score save(Score score) {
        return scoreRepository.save(score);
    }

    // 特定ユーザーのスコア一覧
    public List<Score> findByUserId(Long userId) {
        return scoreRepository.findByUserId(userId);
    }

    // 年度指定
    public List<Score> findByUserIdAndYear(Long userId, Integer year) {
        return scoreRepository.findByUserIdAndYear(userId, year);
    }

    // 全件取得（管理者用など）
    public List<Score> findAll() {
        return scoreRepository.findAll();
    }
}
