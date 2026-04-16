package com.mysite.sbb.task;
import com.mysite.sbb.question.Question;
import com.mysite.sbb.task.temp.*;
import com.mysite.sbb.user.SiteUser;

import java.security.Principal;
import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import jakarta.validation.Valid;
import org.springframework.validation.BindingResult;

@Controller
@RequestMapping("/task")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;
    private final ProjectService projectService;
    private final TempUserService userService;

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/create/{pid}")
    public String createTask(Model model, @PathVariable("pid") Integer pid, TaskCreateForm taskCreateForm, Principal principal) {
        model.addAttribute("pid", pid);
        return "task_create_form";
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/create/{pid}")
    public String createTask(Model model, @PathVariable("pid") Integer pid, @Valid TaskCreateForm taskCreateForm, BindingResult bindingResult, Principal principal) {
        if(bindingResult.hasErrors()) { 
            model.addAttribute("pid", pid); 
            return "task_create_form";
        }
        
        Project project = projectService.getProject(pid);
        TempUser creator = userService.getUser(principal.getName());
        taskService.taskCreate(taskCreateForm.getContent(), project, creator);
        
        return String.format("redirect:/task/list/%d", pid); 
    }
    
    @PreAuthorize("isAuthenticated()")
	@GetMapping("/list/{pid}")
    public String listTask(Model model, @PathVariable("pid") Integer pid, Principal principal){
        Project project= projectService.getProject(pid);
        model.addAttribute("pid", pid); 
        TempUser user = userService.getUser(principal.getName());

        List<Task> tasks = taskService.getAllTaskByUser(project, user);

        model.addAttribute("tasks", tasks);

        return "task_list";
    }
    
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/setMember/{id}")
    public String setMember(Model model, @PathVariable("id") Integer id, TaskCreateForm taskCreateForm, Principal principal, @RequestParam(value = "kw", defaultValue = "")String kw) {
    	Task task = taskService.getTask(id);
    	model.addAttribute("task", task);
        List<TempUser> members = userService.getAll();
        members.remove(task.getCreator());
        model.addAttribute("members", members);
        return "task_add_form";
    }
        
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/setMember/{id}/{name}")
    public String setMember(Model model, @PathVariable("id") Integer id, @PathVariable("name") String name, TaskCreateForm taskCreateForm, Principal principal, @RequestParam(value = "kw", defaultValue = "")String kw) {
    	Task task = taskService.getTask(id);
    	TempUser member = userService.getUser(name);
    	if(task.getMembers().contains(member)) {
    		task = taskService.removeMember(task, member);
    	}
    	else {
    		task = taskService.addMember(task, member);
    	}
		return String.format("redirect:/task/setMember/%s",id);
    }
    
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/setStatus")
    public String setStatus(Model model, @RequestParam(value = "curStatusTask", defaultValue = "")int curTask, @RequestParam(value = "status", defaultValue = "")String status, TaskCreateForm taskCreateForm, Principal principal, @RequestParam(value = "kw", defaultValue = "")String kw) {
    	Task task = taskService.getTask(curTask);
    	taskService.taskModifyStatus(task, status);
		return String.format("redirect:/task/list/%s",task.getProject().id);
    }
    
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/setContent")
    public String setContent(Model model, @RequestParam(value = "curContentTask", defaultValue = "")int curTask, @RequestParam(value = "content", defaultValue = "")String content, TaskCreateForm taskCreateForm, Principal principal, @RequestParam(value = "kw", defaultValue = "")String kw) {
    	Task task = taskService.getTask(curTask);
    	taskService.taskModifyContent(task, content);
		return String.format("redirect:/task/list/%s",task.getProject().id);
    }

//    @PreAuthorize("isAuthenticated()")
//    @PostMapping("/addMember/{id}/{name}")
//    public String addMember(Model model, @PathVariable("id") Integer id, @PathVariable("name") String name, @Valid TaskCreateForm taskCreateForm, BindingResult bindingResult, Principal principal) {
//        if(bindingResult.hasErrors()) {
//            return "task_add_form";
//        }
//        Task task = taskService.getTask(id);
//        
//        TempUser newMember = userService.getUser(name);
//        
//        task = taskService.addMember(task, newMember);
//    	model.addAttribute("task", task);
//        List<TempUser> members = userService.getAll();
//        model.addAttribute("members", members);
//        
//        return String.format("redirect:/task/setMember/%d", id);  
//    }
//    
//    @PreAuthorize("isAuthenticated()")
//    @PostMapping("/removeMember/{id}/{name}")
//    public String removeMember(Model model, @PathVariable("id") Integer id, @PathVariable("name") String name, @Valid TaskCreateForm taskCreateForm, BindingResult bindingResult, Principal principal) {
//        if(bindingResult.hasErrors()) {
//            return "task_add_form";
//        }
//        Task task = taskService.getTask(id);
//        
//        TempUser newMember = userService.getUser(name);
//        task = taskService.removeMember(task, newMember);
//    	model.addAttribute("task", task);
//        List<TempUser> members = userService.getAll();
//        model.addAttribute("members", members);
//        
//        return String.format("redirect:/task/setMember/%d", id);  
//    }
}