package com.example.demo.member;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.demo.user.User;
import com.example.demo.project.Project;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * 프로젝트와 사용자 간의 관계를 정의하는 멤버 엔티티.
 * 특정 사용자가 특정 프로젝트에서 어떤 역할을 하는지 정의함.
 */
@Entity
@Table(name = "project_member", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"project_id", "user_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Member {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Integer id; // 멤버 고유 번호 (PK)
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 연결된 사용자 정보
    
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project; // 소속된 프로젝트 정보
    
    @Column(name = "is_leader", nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    @Builder.Default
    private Boolean isLeader = false; // 팀장 여부 (true: 관리 권한 있음)
}
