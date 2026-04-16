package com.mysite.sbb.task.temp;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class TempUser {
	@Id
	public String name;
}
