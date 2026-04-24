package com.example.demo.project;

import com.example.demo.jwt.JwtUtil;
import com.example.demo.member.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired private ProjectRepository projectRepository;
    @Autowired private MemberRepository memberRepository;
    @Autowired private JwtUtil jwtUtil;

    @GetMapping
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    /** 내가 속한 프로젝트 목록 (JWT 기반) */
    @GetMapping("/my")
    public List<Project> getMyProjects(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) return List.of();
        Integer userId = jwtUtil.getUserId(auth.substring(7));
        return memberRepository.findProjectsByUserId(userId);
    }

    @GetMapping("/{projectId}")
    public Project getProject(@PathVariable Integer projectId) {
        return projectRepository.findById(projectId).orElse(null);
    }

    @PostMapping
    public Project createProject(@RequestBody Project project) {
        return projectRepository.save(project);
    }

    @PutMapping("/{projectId}")
    public Project updateProject(@PathVariable Integer projectId, @RequestBody Project project) {
        project.setId(projectId);
        return projectRepository.save(project);
    }

    @DeleteMapping("/{projectId}")
    public void deleteProject(@PathVariable Integer projectId) {
        projectRepository.deleteById(projectId);
    }
}
