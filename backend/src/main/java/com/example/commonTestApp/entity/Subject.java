package com.example.commonTestApp.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "subjects")
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String category;
    private String name;

    @Column(name = "full_score")
    @JsonProperty("fullScore") //  JSON出力を明示的に指定
    private Integer fullScore;

    @Column(name = "is_active")
    private Boolean isActive = true;
}
