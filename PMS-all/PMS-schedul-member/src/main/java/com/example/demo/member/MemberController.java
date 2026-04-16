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
    public List<Member> getMembersByProject(@PathVariable Integer projectId) {
        return memberService.getMembersByProject(projectId);
    }
    
    @PostMapping
    public Member addMember(
            @RequestParam Integer projectId,
            @RequestParam Integer userId,
            @RequestParam(required = false) Boolean isLeader) {
        return memberService.addMemberToProject(projectId, userId, isLeader);
    }
    
    @DeleteMapping("/{memberId}")
    public void removeMember(@PathVariable Integer memberId) {
        memberService.removeMemberFromProject(memberId);
    }
}
