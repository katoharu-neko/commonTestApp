package com.example.commonTestApp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.commonTestApp.entity.Score;

public interface ScoreRepository extends JpaRepository<Score, Long> {
    List<Score> findByUserId(Long userId);
    List<Score> findByUserIdAndYear(Long userId, Integer year);
}
