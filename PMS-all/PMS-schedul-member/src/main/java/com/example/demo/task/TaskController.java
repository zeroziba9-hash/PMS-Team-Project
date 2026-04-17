package com.example.demo.task;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import com.example.demo.project.Project;
import com.example.demo.user.User;
import com.example.demo.user.UserService;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {
    
    @Autowired
    private TaskService taskService;

    // @Autowired
    // private ProjectService projectService;

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

    // // 일감 추가(Post)
    // @GetMapping("create/{projectId}")// from
    // public String createTask(Model model, @PathVariable("projectId") Integer projectId, @RequestParam(value = "content", defaultValue = "")String content, BindingResult bindingResult, Principal principal) {
	// 	Project project = projectService.getProjectById(projectId);
	// 	User creator = userService.getUserById(principal.getName());
	// 	Task task = taskService.createTask(project, creator, content);
        
	// 	return "redirect:/api/tasks/" + task.getId();
	// }

    // // 일감 일정 조정: 일정 관리에서 taskService.taskModifyStartAt(task, startAt)/EndAt 으로 처리
    
    // // 프로젝트 개요에서 해당 멤버의 task가 보이긴 해야하는데 개요 페이지 어떻게 하시나요
    // public List<Task> listTask(Model model, @PathVariable("pid") Integer pid, Principal principal){
    //     Project project= projectService.getProject(pid);
    //     model.addAttribute("pid", pid); 
    //     User user = userService.getUserById(principal.getName());

    //     return taskService.getAllTaskByUser(pid, user.getId());
    // }

    // 일감의 멤버 관리
    @GetMapping("/{taskId}/setMember")
    public String setMember(@PathVariable("taskId") Integer taskId, Principal principal) {
    	Task task = taskService.getTaskById(taskId);
    	
        List<User> members = userService.getAllUsers();
        
        return "task_members";
    }

    /// 멤버 토글
    /// form으로 받아서 멤버쪽으로 넣어둔 사용자만 member로 처리하고 나머지는 싹 remove해도 됨
    @GetMapping("/{taskId}/setMember/{userId}")
    public String setMember(@PathVariable("taskId") Integer taskId, @PathVariable("userId") Integer userId) {
    	Task task = taskService.getTaskById(taskId);
    	User member = userService.getUserById(userId);
    	if(task.getUsers().contains(member)) {
    		task = taskService.removeMember(task, member);
    	}
    	else {
    		task = taskService.addMember(task, member);
    	}
		return String.format("redirect:/api/task/%s",taskId);
    }

    // status 수정
    @GetMapping("/{taskId}/setStatus")
    public String setStatus(@PathVariable("taskId") Integer taskId, @RequestParam(value = "status", defaultValue = "")int status) {
    	Task task = taskService.getTaskById(taskId);
    	taskService.taskModifyStatus(task, status);
		return String.format("redirect:/api/tasks/%s",taskId);
    }
    
    // content 수정
    @GetMapping("/{taskId}/setContent")
    public String setContent(@PathVariable("taskId") Integer taskId, @RequestParam(value = "content", defaultValue = "")String content) {
    	Task task = taskService.getTaskById(taskId);
    	taskService.taskModifyContent(task, content);
		return String.format("redirect:/api/tasks/%s",taskId);
    }
}
