package com.example.demo.member;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.example.demo.project.Project;
import java.util.List;

@Repository
public interface MemberRepository extends JpaRepository<Member, Integer> {

    List<Member> findByProjectId(Integer projectId);

    Member findByProjectIdAndUserId(Integer projectId, Integer userId);

    // 유저가 속한 프로젝트 목록을 JOIN으로 직접 조회
    @Query("SELECT m.project FROM Member m WHERE m.user.id = :userId")
    List<Project> findProjectsByUserId(@Param("userId") Integer userId);
}
