package com.example.commonTestApp.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Data
@Table(
    name = "official_statistics",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_official_statistics_year_subject", columnNames = {"year", "subject_id"})
    }
)
public class OfficialStatistic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer year;

    @Column(name = "subject_id", nullable = false)
    private Integer subjectId;

    private String category;

    @Column(name = "official_name")
    private String officialName;

    @Column(name = "full_score")
    private Integer fullScore;

    private Integer candidates;

    @Column(name = "average_score")
    private BigDecimal averageScore;

    @Column(name = "std_deviation")
    private BigDecimal stdDeviation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", insertable = false, updatable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Subject subject;
}
