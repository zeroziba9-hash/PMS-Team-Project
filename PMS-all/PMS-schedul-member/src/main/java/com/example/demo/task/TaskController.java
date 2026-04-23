package com.example.demo.task;

import org.springframework.beans.factory.annotation.Autowired;
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
public class TaskController {
    
    @Autowired
    private TaskService taskService;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private UserService userService;
    
    // 일감 전체 페이지에서 보이는 일감 목록(추정)
    @GetMapping("/project/{projectId}")
    public List<Task> getTasksByProject(@PathVariable(name = "projectId") Integer projectId) {
        return taskService.getTasksByProject(projectId);
    }
    
    // 일감 전체 페이지에서 보이는 일감 목록(추정)
    @GetMapping("/project/{projectId}/range")
    public List<Task> getTasksByDateRange(
            @PathVariable(name = "projectId") Integer projectId,
            @RequestParam(name = "startAt") LocalDate startAt,
            @RequestParam(name = "endAt") LocalDate endAt) {
        return taskService.getTasksByProjectAndDateRange(projectId, startAt, endAt);
    }
    
    // 일감 상세(추정)
    @GetMapping("/{taskId}")
    public Task getTask(@PathVariable(name = "taskId") Integer taskId) {
        return taskService.getTaskById(taskId);
    }

    // ============= 이하 추가 함수 =============

    // 일감 관리(본인 일감만 보이도록)
    @GetMapping("/project/{projectId}/{userId}")
    public List<Task> getTasksByProject(@PathVariable(name = "projectId") Integer projectId, @PathVariable(name = "userId") Integer userId) {
        return taskService.getTasksByProjectAndUser(projectId, userId);
    }

    // 일감 추가(Post)
    @PostMapping
    public Task createTask(
            @RequestParam(name = "projectId") Integer projectId,
            @RequestParam(name = "content") String content,
            @RequestParam(name = "creatorId") Integer creatorId) {
        try {
            Project project = projectService.getProjectById(projectId);
            User creator = userService.getUserById(creatorId);
            return taskService.createTask(project, creator, content);
        } catch (RuntimeException e) {
            throw new IllegalArgumentException(e.getMessage());
        }
    }

    @PostMapping("/modify")
    public void modifyTask(
            @RequestParam(name = "taskId") Integer taskId,
            @RequestParam(name = "content", required = false) String content,
            @RequestParam(name = "status", required = false) String status) {
        try {
            Task task = taskService.getTaskById(taskId);
            if(content != null) {
                taskService.taskModifyContent(task, content);
            }
            if(status != null) {
                taskService.taskModifyStatus(task, Integer.parseInt(status));
            }
            return;
        } catch (RuntimeException e) {
            throw new IllegalArgumentException(e.getMessage());
        }
    }

    @PostMapping("/addMember")
    public void addMember(
            @RequestParam(name = "taskId") Integer taskId,
            @RequestParam(name = "memberId") Integer memberId) {
        try {
            Task task = taskService.getTaskById(taskId);
            User member = userService.getUserById(memberId);
            if(!task.getUsers().contains(member)){
                taskService.addMember(task, member);
            }
            return;
        } catch (RuntimeException e) {
            throw new IllegalArgumentException(e.getMessage());
        }
    }

    @PostMapping("/removeMember")
    public void removeMember(
            @RequestParam(name = "taskId") Integer taskId,
            @RequestParam(name = "memberId") Integer memberId) {
        try {
            Task task = taskService.getTaskById(taskId);
            User member = userService.getUserById(memberId);
            if(task.getUsers().contains(member)){
                taskService.removeMember(task, member);
            }
            return;
        } catch (RuntimeException e) {
            throw new IllegalArgumentException(e.getMessage());
        }
    }
    
    @PostMapping("/modifyStart")
    public void modifyStartAt(
            @RequestParam(name = "taskId") Integer taskId,
            @RequestParam(name = "start") LocalDate start) {
        try {
            Task task = taskService.getTaskById(taskId);
            if(task.getEndAt().isEqual(start) || task.getEndAt().isAfter(start)){
                taskService.taskModifyStartAt(task, start);
            }
            return;
        } catch (RuntimeException e) {
            throw new IllegalArgumentException(e.getMessage());
        }
    }

    @PostMapping("/modifyEnd")
    public void modifyEndAt(
            @RequestParam(name = "taskId") Integer taskId,
            @RequestParam(name = "end") LocalDate end) {
        try {
            Task task = taskService.getTaskById(taskId);
            if(task.getStartAt().isEqual(end) || task.getStartAt().isBefore(end)){
                taskService.taskModifyEndAt(task, end);
            }
            return;
        } catch (RuntimeException e) {
            throw new IllegalArgumentException(e.getMessage());
        }
    }
    
    // // 일감 일정 조정: 일정 관리에서 taskService.taskModifyStartAt(task, startAt)/EndAt 으로 처리
    
    // // 프로젝트 개요에서 해당 멤버의 task가 보이긴 해야하는데 개요 페이지 어떻게 하시나요
    // public List<Task> listTask(Model model, @PathVariable("pid") Integer pid, Principal principal){
    //     Project project= projectService.getProject(pid);
    //     model.addAttribute("pid", pid); 
    //     User user = userService.getUserById(principal.getName());

    //     return taskService.getAllTaskByUser(pid, user.getId());
    // }

}
