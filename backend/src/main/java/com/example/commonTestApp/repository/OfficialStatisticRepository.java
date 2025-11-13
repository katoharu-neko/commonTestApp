package com.example.commonTestApp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.commonTestApp.entity.OfficialStatistic;

public interface OfficialStatisticRepository extends JpaRepository<OfficialStatistic, Long> {

    Optional<OfficialStatistic> findByYearAndSubjectId(Integer year, Integer subjectId);

    List<OfficialStatistic> findByYearOrderBySubjectIdAsc(Integer year);

    @Query("SELECT DISTINCT os.year FROM OfficialStatistic os ORDER BY os.year")
    List<Integer> findDistinctYears();
}
