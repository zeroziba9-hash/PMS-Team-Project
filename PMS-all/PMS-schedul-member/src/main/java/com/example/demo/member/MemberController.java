package com.example.demo.member;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 프로젝트 멤버 관련 REST API를 제공하는 컨트롤러입니다.
 */
@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MemberController {
    
    private final MemberService memberService;
    
    /**
     * 특정 프로젝트에 속한 모든 멤버 목록을 조회합니다.
     * 
     * @param projectId 조회할 프로젝트의 ID
     * @return 프로젝트 멤버 리스트
     */
    @GetMapping("/project/{projectId}")
    public List<Member> getMembersByProject(@PathVariable(name = "projectId") Integer projectId) {
        return memberService.getMembersByProject(projectId);
    }
    
    /**
     * 프로젝트에 새로운 멤버를 추가합니다. 관리자 권한이 필요합니다.
     * 
     * @param projectId 멤버를 추가할 프로젝트 ID
     * @param userId 추가할 사용자의 ID
     * @param isLeader 팀장(관리자) 여부
     * @param requesterId 요청을 수행하는 사용자의 ID (권한 검증용)
     * @return 생성된 멤버 정보
     */
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
    
    /**
     * 프로젝트에서 특정 멤버를 삭제(추방)합니다. 관리자 권한이 필요합니다.
     * 
     * @param memberId 삭제할 멤버 엔티티의 ID
     * @param requesterId 요청을 수행하는 사용자의 ID (권한 검증용)
     */
    @DeleteMapping("/{memberId}")
    public void removeMember(
            @PathVariable(name = "memberId") Integer memberId,
            @RequestParam(name = "requesterId") Integer requesterId) {
        memberService.removeMemberFromProject(memberId, requesterId);
    }

    @PutMapping("/{memberId}/role")
    public ResponseEntity<?> updateMemberRole(
        @PathVariable(name = "memberId") Integer memberId,
        @RequestParam(name = "isLeader") boolean isLeader,
        @RequestParam(name = "requesterId") Integer requesterId) {
        
        try {
            memberService.updateMemberRole(memberId, isLeader, requesterId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
