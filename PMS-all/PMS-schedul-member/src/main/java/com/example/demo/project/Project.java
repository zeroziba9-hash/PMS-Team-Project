package com.example.demo.project;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.demo.task.Task;
import com.example.demo.member.Member;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 프로젝트의 기본 정보를 관리하는 엔티티
 */
@Entity
@Table(name = "project")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Project {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "project_id")
    private Integer id; // 프로젝트 ID (PK)
    
    @Column(name = "title", nullable = false, length = 45)
    private String title; // 프로젝트 제목
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description; // 프로젝트 설명
    
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private LocalDateTime updatedAt;

    // --- 관계 설정 ---
    
    // 프로젝트에 포함된 모든 업무 목록
    @JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks;
    
    // 프로젝트에 참여 중인 모든 멤버 목록
    @JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Member> members;
}
