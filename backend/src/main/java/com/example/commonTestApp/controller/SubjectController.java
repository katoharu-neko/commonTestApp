package com.example.commonTestApp.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.commonTestApp.entity.Subject;
import com.example.commonTestApp.repository.SubjectRepository;

@RestController
@RequestMapping("/api/subjects")
@CrossOrigin(origins = "http://localhost:3000")
public class SubjectController {

    private final SubjectRepository subjectRepository;

    public SubjectController(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    // 全教科一覧（例：国語, 数学①, 外国語...）
    @GetMapping("/categories")
    public List<String> getCategories() {
        return subjectRepository.findAll()
                .stream()
                .map(Subject::getCategory)
                .distinct()
                .toList();
    }

    // 教科ごとの科目一覧（例：数学① → 数学I, 数学IA）
    @GetMapping("/{category}")
    public List<Subject> getSubjectsByCategory(@PathVariable String category) {
        return subjectRepository.findByCategory(category);
    }

    // 全科目一覧（確認用）
    @GetMapping
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }
}
