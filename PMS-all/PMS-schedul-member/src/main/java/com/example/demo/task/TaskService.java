package com.example.demo.task;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.example.demo.project.Project;
import com.example.demo.user.User;
import com.example.demo.user.UserService;

@Service
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;
	@Autowired
    private UserService userService;
    
    public Task createTask(Project project, User creator, String content) {
        Task task = new Task();
		task.setProject(project);
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

	/**
     * 특정 프로젝트의 모든 업무를 조회합니다.
     */
    public List<Task> getTasksByProject(Integer projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    public List<Task> getTasksByProjectAndUser(Integer projectId, Integer userId) {
		List<Task> projectTask = taskRepository.findByProjectId(projectId);
		List<Task> result = new ArrayList<Task>();
		User user = userService.getUserById(userId);
		for (Task task : projectTask) {
			if(task.getUsers().contains(user)){
				result.add(task);
			}
		}
        return result;
    }
        
    /**
     * 특정 기간 내에 시작되는 프로젝트 업무들을 조회합니다. (캘린더 뷰 등에 사용)
     * 
     * @param projectId 프로젝트 ID
     * @param startAt 범위 시작일
     * @param endAt 범위 종료일
     * @return 해당 기간 내의 업무 리스트
     */
    public List<Task> getTasksByProjectAndDateRange(Integer projectId, LocalDate startAt, LocalDate endAt) {
        return taskRepository.findByProjectAndDates(projectId, startAt, endAt);
    }
    
	    /**
     * 업무 ID로 상세 정보를 조회합니다.
     * 
     * @param taskId 업무 ID
     * @return 업무 엔티티 (없으면 null)
     */
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
