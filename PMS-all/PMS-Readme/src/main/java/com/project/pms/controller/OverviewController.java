package com.project.pms.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.project.pms.entity.Project;
import com.project.pms.entity.Task;
import com.project.pms.repository.ProjectRepository;
import com.project.pms.repository.TaskRepository;

@Controller
public class OverviewController {
	@Autowired
	private ProjectRepository projectRepository;
	
	@Autowired
	private TaskRepository taskRepository;

	@GetMapping("/overview")
	public String showOverview(Model model) {
		
		Project project = projectRepository.findAll().stream().findFirst().orElse(null);
		if(project != null) {
			model.addAttribute("projectName", project.getTitle());
			model.addAttribute("description", project.getDescription());
			
			List<Task> tasks = taskRepository.findByProject(project);
			
			if (tasks != null && !tasks.isEmpty()) {
				long total = tasks.size(); 
                long doneCount = tasks.stream()
                                      .filter(t -> "DONE".equals(t.getStatus()))
                                      .count(); 
                
                
                int progress = (int) ((double) doneCount / total * 100);
                model.addAttribute("progress", progress);
			} else {
				model.addAttribute("progress", 0);
			}
		}
		
		return "overview";
	}
	
}
