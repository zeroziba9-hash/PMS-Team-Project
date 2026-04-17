package com.example.demo.member;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class MemberController {
    
    @Autowired
    private MemberService memberService;
    
    @GetMapping("/project/{projectId}")
    public List<Member> getMembersByProject(@PathVariable(name = "projectId") Integer projectId) {
        return memberService.getMembersByProject(projectId);
    }
    
    @PostMapping
    public Member addMember(
            @RequestParam(name = "projectId") Integer projectId,
            @RequestParam(name = "userId") Integer userId,
            @RequestParam(name = "isLeader", required = false) Boolean isLeader,
            @RequestParam(name = "requesterId") Integer requesterId) {
        try {
            return memberService.addMemberToProject(projectId, userId, isLeader, requesterId);
        } catch (RuntimeException e) {
            throw new IllegalArgumentException(e.getMessage());
        }
    }
    
    @DeleteMapping("/{memberId}")
    public void removeMember(
            @PathVariable(name = "memberId") Integer memberId,
            @RequestParam(name = "requesterId") Integer requesterId) {
        memberService.removeMemberFromProject(memberId, requesterId);
    }
}
