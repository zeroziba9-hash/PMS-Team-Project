package com.example.demo.member;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MemberRepository extends JpaRepository<Member, Integer> {
    // 프로젝트 ID로 모든 멤버 찾기
    List<Member> findByProjectId(Integer projectId);
    
    // 프로젝트 ID와 유저 ID를 조합해 특정 멤버 존재 확인
    Member findByProjectIdAndUserId(Integer projectId, Integer userId);
}
