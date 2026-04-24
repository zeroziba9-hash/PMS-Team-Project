package com.example.demo.member;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
     */
    @GetMapping("/project/{projectId}")
    public List<Member> getMembersByProject(@PathVariable(name = "projectId") Integer projectId) {
        return memberService.getMembersByProject(projectId);
    }

    /**
     * 프로젝트에 새로운 멤버를 추가합니다. 관리자 권한이 필요합니다.
     */
    @PostMapping
    public ResponseEntity<?> addMember(
            @RequestParam(name = "projectId") Integer projectId,
            @RequestParam(name = "userId") Integer userId,
            @RequestParam(name = "isLeader", required = false) Boolean isLeader,
            @RequestParam(name = "requesterId") Integer requesterId) {
        try {
            Member member = memberService.addMemberToProject(projectId, userId, isLeader, requesterId);
            return ResponseEntity.ok(member);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "멤버 추가 실패"));
        }
    }

    /**
     * 멤버 역할을 변경합니다 (ADMIN ↔ MEMBER). 관리자 권한이 필요합니다.
     */
    @PatchMapping("/{memberId}")
    public ResponseEntity<?> updateMemberRole(
            @PathVariable(name = "memberId") Integer memberId,
            @RequestParam(name = "isLeader") Boolean isLeader,
            @RequestParam(name = "requesterId") Integer requesterId) {
        try {
            Member member = memberService.updateMemberRole(memberId, isLeader, requesterId);
            return ResponseEntity.ok(member);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "역할 변경 실패"));
        }
    }

    /**
     * 프로젝트에서 특정 멤버를 삭제(추방)합니다. 관리자 권한이 필요합니다.
     */
    @DeleteMapping("/{memberId}")
    public ResponseEntity<?> removeMember(
            @PathVariable(name = "memberId") Integer memberId,
            @RequestParam(name = "requesterId") Integer requesterId) {
        try {
            memberService.removeMemberFromProject(memberId, requesterId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "멤버 삭제 실패"));
        }
    }
}
