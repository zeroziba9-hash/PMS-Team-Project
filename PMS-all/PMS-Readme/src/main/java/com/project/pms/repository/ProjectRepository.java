package com.project.pms.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.pms.entity.Project;

public interface ProjectRepository extends JpaRepository<Project, Integer> {

}
