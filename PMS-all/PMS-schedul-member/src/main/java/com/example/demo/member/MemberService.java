package com.example.demo.member;

import com.example.demo.project.Project;
import com.example.demo.project.ProjectService;
import com.example.demo.user.User;
import com.example.demo.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 프로젝트 멤버의 생성, 삭제 및 권한 검증 로직을 담당하는 서비스입니다.
 * 
 * 프로젝트와 유저 간의 관계(Member)를 관리하며, 
 * UserService와 ProjectService를 협력 객체로 사용합니다.
 */
@Service
@RequiredArgsConstructor
public class MemberService {
    
    private final MemberRepository memberRepository;
    private final UserService userService;
    private final ProjectService projectService;

    /**
     * 특정 프로젝트에 소속된 모든 멤버를 조회합니다.
     * 
     * @param projectId 프로젝트 ID
     * @return 멤버 엔티티 리스트
     */
    @Transactional(readOnly = true)
    public List<Member> getMembersByProject(Integer projectId) {
        return memberRepository.findByProjectId(projectId);
    }

    /**
     * 사용자가 특정 프로젝트에 참여 중인지 확인합니다. (페이지 접근 제어용)
     * 
     * @param projectId 프로젝트 ID
     * @param userId 사용자 ID
     * @return 참여 중이면 true
     */
    @Transactional(readOnly = true)
    public boolean isUserInProject(Integer projectId, Integer userId) {
        return memberRepository.findByProjectIdAndUserId(projectId, userId) != null;
    }

    /**
     * 사용자가 해당 프로젝트의 관리자(Leader) 권한을 가지고 있는지 확인합니다.
     * 
     * @param projectId 프로젝트 ID
     * @param userId 사용자 ID
     * @return 관리자면 true
     */
    public boolean isUserAdmin(Integer projectId, Integer userId) {
        Member member = memberRepository.findByProjectIdAndUserId(projectId, userId);
        return member != null && member.getIsLeader();
    }
    
    /**
     * 프로젝트에 새로운 멤버를 추가합니다.
     * 
     * @param projectId 프로젝트 ID
     * @param userId 추가할 유저 ID
     * @param isLeader 리더 부여 여부
     * @param requesterId 추가를 요청한 유저의 ID (관리자여야 함)
     * @return 저장된 Member 엔티티
     * @throws RuntimeException 권한이 없거나, 이미 멤버이거나, 대상이 존재하지 않을 때 발생
     */
    @Transactional
    public Member addMemberToProject(Integer projectId, Integer userId, Boolean isLeader, Integer requesterId) {
        // [1] 권한 검증: 첫 멤버(프로젝트 생성자)이거나 관리자만 추가 가능
        boolean isFirstMember = memberRepository.findByProjectId(projectId).isEmpty();
        if (!isFirstMember && !isUserAdmin(projectId, requesterId)) {
            throw new RuntimeException("관리자 권한이 없습니다. 멤버를 추가할 수 없습니다.");
        }

        // [2] 엔티티 조회: 실제 DB에 존재하는지 확인
        Project project = projectService.getProjectById(projectId);
        User user = userService.getUserById(userId);
        
        // [3] 중복 검사: 이미 멤버라면 다시 추가할 수 없음
        Member existingMember = memberRepository.findByProjectIdAndUserId(projectId, userId);
        if (existingMember != null) {
            throw new RuntimeException("이미 프로젝트에 속한 멤버입니다");
        }
        
        // [4] 데이터 빌드 및 저장
        Member member = Member.builder()
                .user(user)
                .project(project)
                .isLeader(isLeader != null ? isLeader : false)
                .build();
        
        return memberRepository.save(member);
    }
    
    /**
     * 멤버의 역할(isLeader)을 변경합니다.
     */
    @Transactional
    public Member updateMemberRole(Integer memberId, Boolean isLeader, Integer requesterId) {
        Member target = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("멤버를 찾을 수 없습니다."));
        if (!isUserAdmin(target.getProject().getId(), requesterId)) {
            throw new RuntimeException("관리자 권한이 없습니다.");
        }
        target.setIsLeader(isLeader);
        return memberRepository.save(target);
    }

    /**
     * 프로젝트에서 멤버를 삭제합니다.
     *
     * @param memberId 삭제할 멤버의 고유 ID
     * @param requesterId 요청을 수행하는 사용자의 ID
     * @throws RuntimeException 삭제 대상이 없거나 권한이 없을 때 발생
     */
    @Transactional
    public void removeMemberFromProject(Integer memberId, Integer requesterId) {
        Member target = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("멤버를 찾을 수 없습니다."));
        if (!isUserAdmin(target.getProject().getId(), requesterId)) {
            throw new RuntimeException("관리자 권한이 없습니다.");
        }
        memberRepository.deleteById(memberId);
    }
}