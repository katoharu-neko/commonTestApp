package com.example.commonTestApp.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "scores")
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ユーザーID（外部キー相当）
    private Long userId;

    private String subject;
    private Integer score;

    private Integer year; // 例：2025年共通テストなど

    private LocalDateTime createdAt = LocalDateTime.now();
}
