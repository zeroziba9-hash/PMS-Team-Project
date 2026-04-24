package com.example.pmsauth.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByLoginId(String loginId);
    Optional<User> findByLoginId(String loginId);
}
