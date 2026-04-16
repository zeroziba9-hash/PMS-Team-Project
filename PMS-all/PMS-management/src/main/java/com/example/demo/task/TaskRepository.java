package com.example.demo.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Integer> {
    List<Task> findByProjectId(Integer projectId);
    
    List<Task> findByProjectIdAndStartAtBetween(Integer projectId, LocalDateTime startAt, LocalDateTime endAt);
}
