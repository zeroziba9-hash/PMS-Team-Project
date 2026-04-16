package com.mysite.sbb.task;

import java.time.LocalDate;
import java.util.Set;

import com.mysite.sbb.task.temp.*;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
@Getter
public class Task {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(columnDefinition = "TEXT")
	private String content;

	@Column(columnDefinition = "TEXT")
	private String status;

	private LocalDate startDate;

	private LocalDate endDate;

	@ManyToOne
	private Project project;

	@ManyToOne
	private TempUser creator;

	@ManyToMany
	private Set<TempUser> members;
}