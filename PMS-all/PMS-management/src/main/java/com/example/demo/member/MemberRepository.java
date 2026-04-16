package com.example.demo.member;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MemberRepository extends JpaRepository<Member, Integer> {
    List<Member> findByProjectId(Integer projectId);
    
    Member findByProjectIdAndUserId(Integer projectId, Integer userId);
}
