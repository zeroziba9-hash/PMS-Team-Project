package com.example.demo.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * 시스템 사용자 정보 조회를 담당하는 서비스입니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    /**
     * 사용자 ID로 유저 정보를 조회합니다.
     * 
     * @param userId 유저 고유 ID
     * @return 유저 엔티티
     * @throws RuntimeException 유저가 존재하지 않을 경우
     */
    public User getUserById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
    }

    /**
     * 시스템의 모든 사용자 목록을 조회합니다.
     * 
     * @return 전체 유저 리스트
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}