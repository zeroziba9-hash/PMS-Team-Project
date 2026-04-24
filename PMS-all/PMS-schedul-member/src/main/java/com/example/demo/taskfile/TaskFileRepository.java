package com.example.demo.taskfile;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskFileRepository extends JpaRepository<TaskFile, Integer> {
    List<TaskFile> findByTask_IdOrderByCreatedAtAsc(Integer taskId);
}
