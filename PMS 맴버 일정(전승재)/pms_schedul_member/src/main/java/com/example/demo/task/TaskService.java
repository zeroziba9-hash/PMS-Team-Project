package com.example.demo.task;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    public List<Task> getTasksByProject(Integer projectId) {
        return taskRepository.findByProjectId(projectId);
    }
    
    public List<Task> getTasksByProjectAndDateRange(Integer projectId, LocalDateTime startAt, LocalDateTime endAt) {
        return taskRepository.findByProjectIdAndStartAtBetween(projectId, startAt, endAt);
    }
    
    public Task getTaskById(Integer taskId) {
        return taskRepository.findById(taskId).orElse(null);
    }
}
