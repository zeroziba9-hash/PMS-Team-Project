package com.example.demo;

import com.example.demo.member.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * HTML 템플릿(Thymeleaf) 뷰를 반환하는 페이지 컨트롤러
 */
@Controller
public class PageController {

    @Autowired
    private MemberService memberService;

    // 실제 로그인 기능과 합칠 때 세션이나 SecurityContext에서 가져올 현재 사용자 ID (임시값 1)
    private final Integer CURRENT_USER_ID = 1;

    // 메인 인덱스 페이지
    @GetMapping("/project/{projectId}/index")
    public String index() {
        return "index";
    }

    // 멤버 관리 페이지 (권한 확인 로직 포함)
    @GetMapping("/project/{projectId}/members")
    public String members(@PathVariable("projectId") Integer projectId, Model model) {
        // 1. 프로젝트 멤버인지 확인 (접속 권한)
        if (!memberService.isUserInProject(projectId, CURRENT_USER_ID)) {
            return "redirect:/project/error"; // 권한 없음 페이지나 홈으로 리다이렉트
        }

        model.addAttribute("projectId", projectId);
        model.addAttribute("currentUserId", CURRENT_USER_ID); // JS에서 권한 확인용
        return "members";
    }

    // 일정/스케줄 페이지 (권한 확인 로직 포함)
    @GetMapping("/project/{projectId}/schedule")
    public String schedule(@PathVariable("projectId") Integer projectId, Model model) {
        if (!memberService.isUserInProject(projectId, CURRENT_USER_ID)) {
            return "redirect:/project/error";
        }
        model.addAttribute("projectId", projectId);
        model.addAttribute("currentUserId", CURRENT_USER_ID);
        return "schedule";
    }

    // 일정/스케줄 페이지 (권한 확인 로직 포함)
    @GetMapping("/project/{projectId}/tasks")
    public String tasks(@PathVariable("projectId") Integer projectId, Model model) {
        if (!memberService.isUserInProject(projectId, CURRENT_USER_ID)) {
            return "redirect:/project/error";
        }
        model.addAttribute("projectId", projectId);
        model.addAttribute("currentUserId", CURRENT_USER_ID);
        return "tasks";
    }
}