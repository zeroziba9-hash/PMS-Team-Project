package com.example.demo.member;

import com.example.demo.project.Project;
import com.example.demo.project.ProjectRepository;
import com.example.demo.user.User;
import com.example.demo.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * 프로젝트 멤버 관리(추가, 삭제, 권한 확인)를 담당하는 서비스
 */
@Service
public class MemberService {
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    // 특정 프로젝트에 속한 전체 멤버 조회
    public List<Member> getMembersByProject(Integer projectId) {
        return memberRepository.findByProjectId(projectId);
    }

    // 사용자가 해당 프로젝트의 멤버인지 확인
    public boolean isUserInProject(Integer projectId, Integer userId) {
        return memberRepository.findByProjectIdAndUserId(projectId, userId) != null;
    }

    // 사용자가 해당 프로젝트의 관리자(리더)인지 확인
    public boolean isUserAdmin(Integer projectId, Integer userId) {
        Member member = memberRepository.findByProjectIdAndUserId(projectId, userId);
        return member != null && member.getIsLeader();
    }
    
    // 프로젝트에 새로운 멤버 추가 (관리자 권한 필요)
    public Member addMemberToProject(Integer projectId, Integer userId, Boolean isLeader, Integer requesterId) {
        // 요청자가 관리자인지 검증
        if (!isUserAdmin(projectId, requesterId)) {
            throw new RuntimeException("관리자 권한이 없습니다. 멤버를 추가할 수 없습니다.");
        }

        Project project = projectRepository.findById(projectId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);
        
        if (project == null) {
            throw new RuntimeException("프로젝트를 찾을 수 없습니다");
        }
        if (user == null) {
            throw new RuntimeException("사용자를 찾을 수 없습니다");
        }
        
        // 이미 프로젝트에 속한 멤버인지 확인
        Member existingMember = memberRepository.findByProjectIdAndUserId(projectId, userId);
        if (existingMember != null) {
            throw new RuntimeException("이미 프로젝트에 속한 멤버입니다");
        }
        
        Member member = Member.builder()
                .user(user)
                .project(project)
                .isLeader(isLeader != null ? isLeader : false)
                .build();
        
        return memberRepository.save(member);
    }
    
    // 프로젝트에서 멤버 제외 (관리자 권한 필요)
    public void removeMemberFromProject(Integer memberId, Integer requesterId) {
        Member targetMember = memberRepository.findById(memberId).orElse(null);
        if (targetMember != null && !isUserAdmin(targetMember.getProject().getId(), requesterId)) {
            throw new RuntimeException("관리자 권한이 없습니다. 멤버를 삭제할 수 없습니다.");
        }
        memberRepository.deleteById(memberId);
    }
}
