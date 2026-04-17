package com.example.demo.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.demo.task.Task;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.example.demo.member.Member;
import java.util.List;

@Entity
@Table(name = "user")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer id;
    
    @Column(name = "name", nullable = false, length = 10)
    private String name;
    
    @Column(name = "password", nullable = false, length = 45)
    private String password;
    
    // Relationships
    @JsonIgnore
    @ManyToMany(mappedBy = "users", fetch = FetchType.LAZY)
    private List<Task> tasks;
    
    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Member> members;
}
