package com.example.demo.task;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.project.Project;
import com.example.demo.project.ProjectService;
import com.example.demo.user.User;
import com.example.demo.user.UserService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final ProjectService projectService;
    private final UserService userService;

    @GetMapping("/project/{projectId}")
    public List<Task> getTasksByProject(@PathVariable Integer projectId) {
        return taskService.getTasksByProject(projectId);
    }

    @GetMapping("/project/{projectId}/range")
    public List<Task> getTasksByDateRange(
            @PathVariable Integer projectId,
            @RequestParam LocalDate startAt,
            @RequestParam LocalDate endAt) {
        return taskService.getTasksByProjectAndDateRange(projectId, startAt, endAt);
    }

    @GetMapping("/{taskId}")
    public Task getTask(@PathVariable Integer taskId) {
        return taskService.getTaskById(taskId);
    }

    @GetMapping("/project/{projectId}/{userId}")
    public List<Task> getTasksByProjectAndUser(
            @PathVariable Integer projectId,
            @PathVariable Integer userId) {
        return taskService.getTasksByProjectAndUser(projectId, userId);
    }

    @PostMapping
    public Task createTask(
            @RequestParam Integer projectId,
            @RequestParam String content,
            @RequestParam Integer creatorId,
            @RequestParam(required = false) LocalDate startAt,
            @RequestParam(required = false) LocalDate endAt) {
        Project project = projectService.getProjectById(projectId);
        User creator = userService.getUserById(creatorId);
        return taskService.createTask(project, creator, content, startAt, endAt);
    }

    @PostMapping("/modify")
    public ResponseEntity<Void> modifyTask(
            @RequestParam Integer taskId,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String description) {
        Task task = taskService.getTaskById(taskId);
        if (content != null) taskService.taskModifyContent(task, content);
        if (status != null) taskService.taskModifyStatus(task, Integer.parseInt(status));
        if (description != null) taskService.taskModifyDescription(task, description);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/addMember")
    public ResponseEntity<Void> addMember(
            @RequestParam Integer taskId,
            @RequestParam Integer memberId) {
        Task task = taskService.getTaskById(taskId);
        User member = userService.getUserById(memberId);
        if (!task.getUsers().contains(member)) taskService.addMember(task, member);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/removeMember")
    public ResponseEntity<Void> removeMember(
            @RequestParam Integer taskId,
            @RequestParam Integer memberId) {
        Task task = taskService.getTaskById(taskId);
        User member = userService.getUserById(memberId);
        if (task.getUsers().contains(member)) taskService.removeMember(task, member);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/modifyStart")
    public ResponseEntity<Void> modifyStartAt(
            @RequestParam Integer taskId,
            @RequestParam LocalDate start) {
        Task task = taskService.getTaskById(taskId);
        if (!task.getEndAt().isBefore(start)) taskService.taskModifyStartAt(task, start);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/modifyEnd")
    public ResponseEntity<Void> modifyEndAt(
            @RequestParam Integer taskId,
            @RequestParam LocalDate end) {
        Task task = taskService.getTaskById(taskId);
        if (!task.getStartAt().isAfter(end)) taskService.taskModifyEndAt(task, end);
        return ResponseEntity.ok().build();
    }

    /** 태스크 삭제 */
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Integer taskId) {
        Task task = taskService.getTaskById(taskId);
        taskService.taskDelete(task);
        return ResponseEntity.noContent().build();
    }
}
