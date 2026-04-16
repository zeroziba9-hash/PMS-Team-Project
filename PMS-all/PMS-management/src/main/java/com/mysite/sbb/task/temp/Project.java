package com.mysite.sbb.task.temp;

import java.util.List;

import com.mysite.sbb.task.Task;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class Project {
	@Id
	public Integer id;
	
	@OneToMany(mappedBy = "project", cascade = CascadeType.REMOVE)
	public List<Task> taskList;
}
