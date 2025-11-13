package com.example.commonTestApp.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.commonTestApp.entity.OfficialStatistic;
import com.example.commonTestApp.repository.OfficialStatisticRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class OfficialStatisticController {

    private final OfficialStatisticRepository officialStatisticRepository;

    @GetMapping("/official")
    public List<OfficialStatisticResponse> getOfficialStatistics(@RequestParam Integer year) {
        return officialStatisticRepository.findByYearOrderBySubjectIdAsc(year)
                .stream()
                .map(OfficialStatisticResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/official/years")
    public List<Integer> getAvailableYears() {
        return officialStatisticRepository.findDistinctYears();
    }

    public record OfficialStatisticResponse(
            Long id,
            Integer year,
            Integer subjectId,
            String category,
            String officialName,
            Integer fullScore,
            Integer candidates,
            java.math.BigDecimal averageScore,
            java.math.BigDecimal stdDeviation
    ) {
        static OfficialStatisticResponse fromEntity(OfficialStatistic entity) {
            return new OfficialStatisticResponse(
                    entity.getId(),
                    entity.getYear(),
                    entity.getSubjectId(),
                    entity.getCategory(),
                    entity.getOfficialName(),
                    entity.getFullScore(),
                    entity.getCandidates(),
                    entity.getAverageScore(),
                    entity.getStdDeviation()
            );
        }
    }
}
