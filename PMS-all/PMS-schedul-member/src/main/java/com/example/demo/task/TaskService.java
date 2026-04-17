package com.example.demo.task;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.example.demo.project.Project;
import com.example.demo.user.User;

@Service
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    public Task createTask(Project project, User creator, String content) {
        Task task = new Task();
        List<User> members = new ArrayList<User>();
        members.add(creator);
        task.setUsers(members);
        task.setContent(content);
        task.setStartAt(LocalDate.now());
        task.setEndAt(LocalDate.now());
        task.setStatus(0);
        taskRepository.save(task);
        return task;
    }

    public List<Task> getTasksByProject(Integer projectId) {
        return taskRepository.findByProjectId(projectId);
    }
    
    public List<Task> getTasksByProjectAndDateRange(Integer projectId, LocalDate startAt, LocalDate endAt) {
        return taskRepository.findByProjectAndDates(projectId, startAt, endAt);
    }
    
    public Task getTaskById(Integer taskId) {
        return taskRepository.findById(taskId).orElse(null);
    }

    public List<Task> getAllTaskByUser(Integer projectId, Integer memberId) {
		return taskRepository.findByProjectIdAndUser(projectId, memberId);
	}

	public List<Task>getTasksByProjectAndDates(Integer projectId, LocalDate fromDate, LocalDate toDate){
		return taskRepository.findByProjectAndDates(projectId, fromDate, toDate);
	}

    public void taskModifyContent(Task task, String content) {
		task.setContent(content);
		taskRepository.save(task);
	}

	public void taskModifyStatus(Task task, Integer status) {
		task.setStatus(status);
		taskRepository.save(task);
	}

	public void taskModifyStartAt(Task task, LocalDate startAt) {
		task.setStartAt(startAt);
		taskRepository.save(task);
	}
	
	public void taskModifyEndAt(Task task, LocalDate endAt) {
		task.setEndAt(endAt);
		taskRepository.save(task);
	}

	public void taskDelete(Task task) {
		taskRepository.delete(task);
	}
	
	public Task addMember(Task task, User user) {
		task.getUsers().add(user);
		taskRepository.save(task);
		return task;
	}
	
	public Task removeMember(Task task, User user) {
		task.getUsers().remove(user);
		taskRepository.save(task);
		return task;
	}
}
