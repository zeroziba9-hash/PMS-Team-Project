package com.mysite.sbb.task;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TaskModifyForm {

	@NotBlank(message = "내용은 필수 항목입니다.")
	private String content;

	private String status;
}