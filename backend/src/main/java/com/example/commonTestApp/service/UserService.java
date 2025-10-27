package com.example.commonTestApp.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.commonTestApp.dto.UserProfileResponse;
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

    public UserProfileResponse getProfileByEmail(String email) {
        User user = userRepository.findByEmailFetchRole(email)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません"));

        String roleName = user.getRole() != null ? user.getRole().getName() : null;

        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                roleName,
                user.getVerified()
        );
    }
}
