package com.example.commonTestApp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.commonTestApp.entity.Subject;

public interface SubjectRepository extends JpaRepository<Subject, Integer> {
    List<Subject> findByCategory(String category);
}
