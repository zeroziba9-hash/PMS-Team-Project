package com.example.demo.project;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @GetMapping
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }
    
    @GetMapping("/{projectId}")
    public Project getProject(@PathVariable(name = "projectId") Integer projectId) {
        return projectRepository.findById(projectId).orElse(null);
    }
    
    @PostMapping
    public Project createProject(@RequestBody Project project) {
        return projectRepository.save(project);
    }
    
    @PutMapping("/{projectId}")
    public Project updateProject(@PathVariable(name = "projectId") Integer projectId, @RequestBody Project project) {
        project.setId(projectId);
        return projectRepository.save(project);
    }
    
    @DeleteMapping("/{projectId}")
    public void deleteProject(@PathVariable(name = "projectId") Integer projectId) {
        projectRepository.deleteById(projectId);
    }
}
