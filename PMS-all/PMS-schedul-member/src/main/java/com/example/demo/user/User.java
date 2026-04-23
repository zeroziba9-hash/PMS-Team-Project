package com.example.demo.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.demo.task.Task;
import com.example.demo.member.Member;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

/**
 * 시스템 사용자 정보를 저장하는 엔티티
 */
@Entity
@Table(name = "user")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer id; // 사용자 고유 번호 (PK)
    
    @Column(name = "name", nullable = false, length = 50)
    private String name; // 사용자 이름
    
    @Column(name = "password", nullable = false, length = 255)
    private String password; // 암호화된 비밀번호 (추후 시큐리티 적용 권장)

    @Column(name = "login_id", nullable = false, length = 50, unique = true)
    private String loginId;

    // --- 관계 설정 ---
    
    // 사용자가 참여 중인 업무 목록 (다대다 관계의 역방향)
    @JsonIgnore
    @ManyToMany(mappedBy = "users", fetch = FetchType.LAZY)
    private List<Task> tasks;
    
    // 사용자가 소속된 프로젝트 멤버 정보 (1대다)
    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Member> members;
}
