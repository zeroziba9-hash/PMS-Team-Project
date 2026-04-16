package com.example.demo.member;

import com.example.demo.project.Project;
import com.example.demo.project.ProjectRepository;
import com.example.demo.user.User;
import com.example.demo.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MemberService {
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    public List<Member> getMembersByProject(Integer projectId) {
        return memberRepository.findByProjectId(projectId);
    }
    
    public Member addMemberToProject(Integer projectId, Integer userId, Boolean isLeader) {
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
    
    public void removeMemberFromProject(Integer memberId) {
        memberRepository.deleteById(memberId);
    }
}
