package com.example.demo;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
@RequiredArgsConstructor
public class PageController {

    @GetMapping("/")
    public String root() { return "redirect:/login"; }

    @GetMapping("/login")
    public String login() { return "login"; }

    /** 프로젝트 허브 (전체 프로젝트 선택 화면) */
    @GetMapping("/projects")
    public String projects() { return "projects"; }

    @GetMapping("/project/{projectId}/index")
    public String index(@PathVariable Integer projectId, Model model) {
        model.addAttribute("projectId", projectId);
        return "index";
    }

    @GetMapping("/project/{projectId}/members")
    public String members(@PathVariable Integer projectId, Model model) {
        model.addAttribute("projectId", projectId);
        return "members";
    }

    @GetMapping("/project/{projectId}/schedule")
    public String schedule(@PathVariable Integer projectId, Model model) {
        model.addAttribute("projectId", projectId);
        return "schedule";
    }

    @GetMapping("/project/{projectId}/tasks")
    public String tasks(@PathVariable Integer projectId, Model model) {
        model.addAttribute("projectId", projectId);
        return "tasks";
    }
}
