package com.mysite.sbb.task;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TaskCreateForm {

	@NotBlank(message = "내용은 필수 항목입니다.")
	private String content;
}