package com.mysite.sbb.task.temp;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectService {
	private final ProjectRepository projectRepository;

	public Project getProject(Integer id){
		Project p = projectRepository.getById(id);
        return p;
    }
}
