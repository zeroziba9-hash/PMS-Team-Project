package com.example.demo.task;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> getTasksByProject(Integer projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    public List<Task> getTasksByProjectAndDateRange(Integer projectId, LocalDateTime startAt, LocalDateTime endAt) {
        return taskRepository.findByProjectIdAndStartAtBetween(projectId, startAt, endAt);
    }

    public Task getTaskById(Integer taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
    }
}