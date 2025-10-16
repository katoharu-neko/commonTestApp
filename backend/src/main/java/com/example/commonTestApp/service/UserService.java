package com.example.commonTestApp.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.commonTestApp.entity.User;
import com.example.commonTestApp.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("メールアドレスは既に登録されています。");
        }
        return userRepository.save(user);
    }
}
