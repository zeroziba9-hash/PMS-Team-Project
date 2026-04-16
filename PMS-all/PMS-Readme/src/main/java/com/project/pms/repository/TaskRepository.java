package com.project.pms.repository;

import com.project.pms.entity.Project;
import com.project.pms.entity.Task;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
	
	List<Task> findByProject(Project project);

}
