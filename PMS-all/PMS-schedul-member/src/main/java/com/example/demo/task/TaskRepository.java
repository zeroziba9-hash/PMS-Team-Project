package com.example.demo.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Integer> {
    // 프로젝트 ID 기반
    List<Task> findByProjectId(Integer projectId);
    List<Task> findByProjectIdAndStartAtBetween(Integer projectId, LocalDateTime startAt, LocalDateTime endAt);
    
    /* h2 콘솔 기준 (projectId: 0, userId: 0)
    select distinct *
    from task t
    inner join project p on p.id = t.project_id
    inner join task_users tu on t.id = tu.task_id
    inner join user u on u.id = tu.users_id
    where p.id = 0
    and u.name = 0
    */
    @Query(
        "select distinct t "
        +"from Task t "
        +"inner join Project p on t.project = p "
        +"inner join p.members m "
        +"where p.id = :pid "
        +"and m.id = :mid "
    )// 프로젝트 ID 및 사용자 기반(특정 프로젝트 중 특정 사용자가 진행하는 모든 일감)
    List<Task> findByProjectIdAndUser(@Param("pid")Integer projectId, @Param("mid")Integer memberId);

    /*  h2 콘솔 기준 (projectId: 0, from: 2026-04-10, to: 2026-04-15)
    select distinct *
    from task t
    inner join project p on p.id = t.project_id
    where p.id = 0
    and (t.start_at between '2026-04-10'  and '2026-04-15'
    or t.end_at between '2026-04-10'  and '2026-04-15')
     */
    @Query(
        "select distinct t "
        +"from Task t "
        +"inner join Project p on t.project = p "
        +"where p.id = :pid "
        +"and (t.startAt between :from and :to "
        +"or t.endAt between :from and :to) "
    )// 프로젝트 ID 및 날짜 기반(특정 프로젝트 중 범위 내에서 진행하는 모든 일감)
    List<Task> findByProjectAndDates(@Param("pid")Integer projectId, @Param("from")LocalDate fromDate, @Param("to")LocalDate toDate);
}
