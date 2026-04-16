package com.example.demo.task;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {
    
    @Autowired
    private TaskService taskService;
    
    @GetMapping("/project/{projectId}")
    public List<Task> getTasksByProject(@PathVariable(name = "projectId") Integer projectId) {
        return taskService.getTasksByProject(projectId);
    }
    
    @GetMapping("/project/{projectId}/range")
    public List<Task> getTasksByDateRange(
            @PathVariable(name = "projectId") Integer projectId,
            @RequestParam(name = "startAt") String startAt,
            @RequestParam(name = "endAt") String endAt) {
        // ISO 8601 형식의 날짜 문자열을 LocalDateTime으로 변환
        LocalDateTime start = LocalDateTime.parse(startAt);
        LocalDateTime end = LocalDateTime.parse(endAt);
        return taskService.getTasksByProjectAndDateRange(projectId, start, end);
    }
    
    @GetMapping("/{taskId}")
    public Task getTask(@PathVariable(name = "taskId") Integer taskId) {
        return taskService.getTaskById(taskId);
    }
}
