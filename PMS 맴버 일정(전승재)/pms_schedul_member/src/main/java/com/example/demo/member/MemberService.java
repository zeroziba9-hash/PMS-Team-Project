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
        
        if (project == null || user == null) {
            return null;
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
