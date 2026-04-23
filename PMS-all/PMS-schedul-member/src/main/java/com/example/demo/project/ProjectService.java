package com.example.demo.project;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 프로젝트 정보 조회 및 관리를 담당하는 서비스입니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;

    /**
     * 프로젝트 ID로 프로젝트 엔티티를 조회합니다.
     * 
     * @param projectId 프로젝트 ID
     * @return 조회된 프로젝트 엔티티
     * @throws RuntimeException 프로젝트가 존재하지 않을 경우
     */
    public Project getProjectById(Integer projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다: " + projectId));
    }
}