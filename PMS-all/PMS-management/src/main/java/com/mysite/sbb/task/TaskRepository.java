package com.mysite.sbb.task;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

import com.mysite.sbb.task.temp.*;

public interface TaskRepository extends JpaRepository<Task, Integer> {
	List<Task> findByProject(Project project);
	List<Task> findByContentLike(String content);
	List<Task> findByStatusLike(String status);
	List<Task> findByCreator(TempUser creator);
	List<Task> findByMembersContains(TempUser member);
	List<Task> findByStartDateBetweenOrEndDateBetween(LocalDate startDate1, LocalDate startDate2, LocalDate endDate1, LocalDate endDate2);
}