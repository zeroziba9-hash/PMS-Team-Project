package com.mysite.sbb.task;
import com.mysite.sbb.task.temp.*;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {
	private final TaskRepository taskRepository;

	public Task taskCreate(String content, Project project, TempUser creator) {
		Task task = new Task();
		task.setContent(content);
		task.setStatus("start");
		task.setStartDate(LocalDate.now());
		task.setEndDate(LocalDate.now());
		task.setProject(project);
		task.setCreator(creator);
		taskRepository.save(task);
		return task;
	}

	public Task getTask(Integer id) {
		Optional<Task> ot = taskRepository.findById(id);
		if (ot.isPresent())
			return ot.get();
		return null;
	}

	public List<Task> getAllTask(Project project) {
		List<Task> allTasks = taskRepository.findByProject(project);
		return allTasks;
	}

	public List<Task> getAllTaskByUser(Project project, TempUser user) {
		List<Task> projects = taskRepository.findByProject(project);

		Set<Task> userBy = new HashSet<>(taskRepository.findByCreator(user));
		userBy.addAll(taskRepository.findByMembersContains(user));

		List<Task> result = projects.stream()
				.filter(userBy::contains)
				.collect(Collectors.toList());

		return result;
	}

	public void taskModifyContent(Task task, String content) {
		task.setContent(content);
		taskRepository.save(task);
	}

	public void taskModifyStatus(Task task, String status) {
		task.setStatus(status);
		taskRepository.save(task);
	}

	public void taskModifyDate(Task task, LocalDate startDate, LocalDate endDate) {
		task.setStartDate(startDate);
		task.setEndDate(endDate);
		taskRepository.save(task);
	}

	public void taskDelete(Task task) {
		taskRepository.delete(task);
	}
	
	public Task addMember(Task task, TempUser user) {
		task.getMembers().add(user);
		taskRepository.save(task);
		return task;
	}
	
	public Task removeMember(Task task, TempUser user) {
		task.getMembers().remove(user);
		taskRepository.save(task);
		return task;
	}
}